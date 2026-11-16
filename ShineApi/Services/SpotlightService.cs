using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

/// <summary>
/// The landing spotlight: a pure function of the date. Each day presents a
/// different player and a different team — a window into the record, not a
/// ranking and not a curation workflow. The pick is `day-number mod pool-size`
/// over a deterministic order, so no state is stored and the pick is stable
/// for a given date and record; the response can be cached. Performance
/// totals appear only as the featured subject's own record, never compared
/// or ranked.
/// </summary>
public class SpotlightService(ShineDbContext db) : ISpotlightService
{
    private const int RecentMatchCount = 5;

    public async Task<SpotlightResponseDto> GetAsync(DateOnly? asOf)
    {
        var day = asOf ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var response = new SpotlightResponseDto
        {
            AsOf = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        };

        var player = await PickPlayerAsync(day);
        if (player is not null)
            response.Player = await BuildPlayerAsync(player);

        var team = await PickTeamAsync(day);
        if (team is not null)
            response.Team = await BuildTeamAsync(team, day);

        return response;
    }

    // --- Rotation -----------------------------------------------------------

    /// <summary>
    /// Prefer players the record can say something about — at least one club
    /// affiliation or squad entry — so the spotlight rarely lands on a bare
    /// name; fall back to the whole registry while the record is young.
    /// </summary>
    private async Task<Player?> PickPlayerAsync(DateOnly day)
    {
        var withFacts = db.Player
            .AsNoTracking()
            .Where(p => db.PlayerClub.Any(pc => pc.PlayerId == p.PlayerId)
                || db.ClubMatchSquad.Any(s => s.PlayerId == p.PlayerId)
                || db.NationalTeamMatchSquad.Any(s => s.PlayerId == p.PlayerId))
            .OrderBy(p => p.PlayerId);

        var count = await withFacts.CountAsync();
        if (count > 0)
            return await withFacts.Skip(day.DayNumber % count).FirstAsync();

        count = await db.Player.CountAsync();
        return count == 0
            ? null
            : await db.Player.AsNoTracking().OrderBy(p => p.PlayerId)
                .Skip(day.DayNumber % count).FirstAsync();
    }

    private sealed record TeamPick(int Id, string Kind, string Name);

    /// <summary>Clubs and national teams in one pool — every team gets a turn.</summary>
    private async Task<TeamPick?> PickTeamAsync(DateOnly day)
    {
        var clubs = await db.Club
            .AsNoTracking()
            .OrderBy(c => c.ClubId)
            .Select(c => new TeamPick(c.ClubId, SearchKinds.Club, c.Name))
            .ToListAsync();
        var nationalTeams = await db.NationalTeam
            .AsNoTracking()
            .OrderBy(t => t.NationalTeamId)
            .Select(t => new TeamPick(t.NationalTeamId, SearchKinds.NationalTeam, t.Name))
            .ToListAsync();

        var total = clubs.Count + nationalTeams.Count;
        if (total == 0) return null;

        var index = day.DayNumber % total;
        return index < clubs.Count ? clubs[index] : nationalTeams[index - clubs.Count];
    }

    // --- Player composition ---------------------------------------------------

    private async Task<SpotlightPlayerDto> BuildPlayerAsync(Player player)
    {
        var id = player.PlayerId;

        var clubRecord = await db.ClubMatchSquad
            .AsNoTracking()
            .Where(s => s.PlayerId == id)
            .GroupBy(_ => 1)
            .Select(g => new { Apps = g.Count(), Goals = g.Sum(s => s.Goals), Assists = g.Sum(s => s.Assists) })
            .FirstOrDefaultAsync();
        var nationalRecord = await db.NationalTeamMatchSquad
            .AsNoTracking()
            .Where(s => s.PlayerId == id)
            .GroupBy(_ => 1)
            .Select(g => new { Apps = g.Count(), Goals = g.Sum(s => s.Goals), Assists = g.Sum(s => s.Assists) })
            .FirstOrDefaultAsync();

        var currentClub = await db.PlayerClub
            .AsNoTracking()
            .Include(pc => pc.Club)
            .Where(pc => pc.PlayerId == id && pc.IsCurrent)
            .OrderByDescending(pc => pc.StartDate)
            .FirstOrDefaultAsync();

        var latestNationalSide = await db.NationalTeamMatchSquad
            .AsNoTracking()
            .Include(s => s.NationalTeam)
            .Include(s => s.Match)
            .Where(s => s.PlayerId == id)
            .OrderByDescending(s => s.Match!.MatchDate)
            .FirstOrDefaultAsync();

        return new SpotlightPlayerDto
        {
            PlayerId = player.PlayerId,
            Name = DisplayName(player.KnownAs, player.FullName),
            FullName = player.FullName,
            PositionPrimary = player.PositionPrimary,
            PrimaryRole = player.PrimaryRole,
            DateOfBirth = IsoDate(player.DateOfBirth),
            HeightCm = player.HeightCm,
            Foot = player.Foot,
            Status = player.Status,
            Nationality = player.Nationality,
            CurrentClub = currentClub?.Club?.Name,
            NationalTeam = latestNationalSide?.NationalTeam?.Name,
            Record = new SpotlightRecordDto
            {
                ClubAppearances = clubRecord?.Apps ?? 0,
                ClubGoals = clubRecord?.Goals ?? 0,
                ClubAssists = clubRecord?.Assists ?? 0,
                NationalAppearances = nationalRecord?.Apps ?? 0,
                NationalGoals = nationalRecord?.Goals ?? 0,
                NationalAssists = nationalRecord?.Assists ?? 0,
            },
            RecentMatches = await RecentPlayerMatchesAsync(id),
        };
    }

    /// <summary>The player's latest match participations, club and national merged, newest first.</summary>
    private async Task<List<SpotlightMatchDto>> RecentPlayerMatchesAsync(int playerId)
    {
        var clubEntries = await db.ClubMatchSquad
            .AsNoTracking()
            .Include(s => s.Match).ThenInclude(m => m!.HomeClub)
            .Include(s => s.Match).ThenInclude(m => m!.AwayClub)
            .Where(s => s.PlayerId == playerId)
            .OrderByDescending(s => s.Match!.MatchDate)
            .Take(RecentMatchCount)
            .ToListAsync();
        var nationalEntries = await db.NationalTeamMatchSquad
            .AsNoTracking()
            .Include(s => s.Match).ThenInclude(m => m!.HomeNationalTeam)
            .Include(s => s.Match).ThenInclude(m => m!.AwayNationalTeam)
            .Where(s => s.PlayerId == playerId)
            .OrderByDescending(s => s.Match!.MatchDate)
            .Take(RecentMatchCount)
            .ToListAsync();

        return clubEntries.Select(s => PlayerMatch(SearchKinds.ClubMatch, s))
            .Concat(nationalEntries.Select(s => PlayerMatch(SearchKinds.NationalTeamMatch, s)))
            .OrderByDescending(m => m.Date)
            .Take(RecentMatchCount)
            .ToList();
    }

    private static SpotlightMatchDto PlayerMatch(string kind, ClubMatchSquad s) => new()
    {
        Kind = kind,
        MatchId = s.MatchId,
        Date = IsoDate(s.Match?.MatchDate) ?? string.Empty,
        Competition = s.Match?.Competition,
        Label = MatchLabel(s.Match?.HomeClub?.Name, s.Match?.AwayClub?.Name,
            s.Match?.HomeScore, s.Match?.AwayScore),
        LineupStatus = s.LineupStatus,
        MinutesPlayed = s.MinutesPlayed,
        Goals = s.Goals,
        Assists = s.Assists,
        Captain = s.Captain,
    };

    private static SpotlightMatchDto PlayerMatch(string kind, NationalTeamMatchSquad s) => new()
    {
        Kind = kind,
        MatchId = s.MatchId,
        Date = IsoDate(s.Match?.MatchDate) ?? string.Empty,
        Competition = s.Match?.Competition,
        Label = MatchLabel(s.Match?.HomeNationalTeam?.Name, s.Match?.AwayNationalTeam?.Name,
            s.Match?.HomeScore, s.Match?.AwayScore),
        LineupStatus = s.LineupStatus,
        MinutesPlayed = s.MinutesPlayed,
        Goals = s.Goals,
        Assists = s.Assists,
        Captain = s.Captain,
    };

    // --- Team composition -----------------------------------------------------

    private async Task<SpotlightTeamDto?> BuildTeamAsync(TeamPick pick, DateOnly day)
        => pick.Kind == SearchKinds.Club
            ? await BuildClubTeamAsync(pick.Id, day)
            : await BuildNationalTeamAsync(pick.Id, day);

    private async Task<SpotlightTeamDto?> BuildClubTeamAsync(int clubId, DateOnly day)
    {
        var club = await db.Club
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ClubId == clubId);
        if (club is null) return null; // deleted between the pick and the build

        var recentMatches = await db.ClubMatch
            .AsNoTracking()
            .Include(m => m.HomeClub)
            .Include(m => m.AwayClub)
            .Where(m => m.HomeClubId == clubId || m.AwayClubId == clubId)
            .OrderByDescending(m => m.MatchDate)
            .Take(RecentMatchCount)
            .ToListAsync();

        return new SpotlightTeamDto
        {
            Kind = SearchKinds.Club,
            Id = club.ClubId,
            Name = club.Name,
            ShortName = club.ShortName,
            Subtitle = JoinNonEmpty(club.City, club.Country, club.FoundedYear?.ToString()),
            Coach = await ResolveCoachAsync(clubId: clubId, nationalTeamId: null, day),
            SquadSize = await db.PlayerClub.CountAsync(pc => pc.ClubId == clubId && pc.IsCurrent),
            RecentMatches = recentMatches
                .Select(m => TeamMatch(SearchKinds.ClubMatch, m.MatchId, m.MatchDate, m.Competition,
                    MatchLabel(m.HomeClub?.Name, m.AwayClub?.Name, m.HomeScore, m.AwayScore),
                    ResultFor(clubId, m.HomeClubId, m.HomeScore, m.AwayScore)))
                .ToList(),
        };
    }

    private async Task<SpotlightTeamDto?> BuildNationalTeamAsync(int nationalTeamId, DateOnly day)
    {
        var team = await db.NationalTeam
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.NationalTeamId == nationalTeamId);
        if (team is null) return null; // deleted between the pick and the build

        var recentMatches = await db.NationalTeamMatch
            .AsNoTracking()
            .Include(m => m.HomeNationalTeam)
            .Include(m => m.AwayNationalTeam)
            .Where(m => m.HomeNationalTeamId == nationalTeamId || m.AwayNationalTeamId == nationalTeamId)
            .OrderByDescending(m => m.MatchDate)
            .Take(RecentMatchCount)
            .ToListAsync();

        var coach = await ResolveCoachAsync(clubId: null, nationalTeamId: nationalTeamId, day)
            ?? team.Coach; // fall back to the record's own coach line

        return new SpotlightTeamDto
        {
            Kind = SearchKinds.NationalTeam,
            Id = team.NationalTeamId,
            Name = team.Name,
            ShortName = team.ShortName,
            Subtitle = JoinNonEmpty(team.Nickname, team.Gender, team.Level),
            Coach = coach,
            SquadSize = await db.NationalTeamMatchSquad
                .Where(s => s.NationalTeamId == nationalTeamId)
                .Select(s => s.PlayerId)
                .Distinct()
                .CountAsync(),
            RecentMatches = recentMatches
                .Select(m => TeamMatch(SearchKinds.NationalTeamMatch, m.MatchId, m.MatchDate, m.Competition,
                    MatchLabel(m.HomeNationalTeam?.Name, m.AwayNationalTeam?.Name, m.HomeScore, m.AwayScore),
                    ResultFor(nationalTeamId, m.HomeNationalTeamId, m.HomeScore, m.AwayScore)))
                .ToList(),
        };
    }

    /// <summary>The derived "the coach" — highest-priority ongoing appointment
    /// (head_coach → manager → caretaker). Undated stints (unknown start) rank
    /// below dated ones of the same priority, since Postgres would otherwise
    /// put their NULL start first on a descending sort.</summary>
    private async Task<string?> ResolveCoachAsync(int? clubId, int? nationalTeamId, DateOnly day)
    {
        var appointments = await db.StaffAppointment
            .AsNoTracking()
            .Include(a => a.StaffMember)
            .Where(a => clubId.HasValue ? a.ClubId == clubId : a.NationalTeamId == nationalTeamId)
            .Where(a => a.EndDate == null || a.EndDate >= day)
            .ToListAsync();

        var coach = appointments
            .OrderBy(a => StaffRoles.CoachPriority(a.Role))
            .ThenBy(a => a.StartDate == null)
            .ThenByDescending(a => a.StartDate)
            .FirstOrDefault();

        return coach?.StaffMember is null ? null : DisplayName(coach.StaffMember.KnownAs, coach.StaffMember.FullName);
    }

    // --- Shared helpers ---------------------------------------------------------

    private static string DisplayName(string? knownAs, string fullName)
        => string.IsNullOrWhiteSpace(knownAs) ? fullName : knownAs;

    private static string? IsoDate(DateOnly? date)
        => date?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string JoinNonEmpty(params string?[] parts)
        => string.Join(" · ", parts.Where(s => !string.IsNullOrWhiteSpace(s)));

    /// <summary>"Malawi 3–1 Botswana", or "A vs B" while scores are unknown.</summary>
    private static string MatchLabel(string? home, string? away, int? homeScore, int? awayScore)
    {
        var hasScore = homeScore.HasValue || awayScore.HasValue;
        var score = hasScore ? $"{homeScore?.ToString() ?? "?"}–{awayScore?.ToString() ?? "?"}" : "vs";
        return $"{home ?? "?"} {score} {away ?? "?"}";
    }

    /// <summary>W / D / L from the given team's perspective, null while scores are missing.</summary>
    private static string? ResultFor(int teamId, int? homeTeamId, int? homeScore, int? awayScore)
    {
        if (homeScore is null || awayScore is null) return null;
        var isHome = homeTeamId == teamId;
        var own = isHome ? homeScore.Value : awayScore!.Value;
        var opponent = isHome ? awayScore!.Value : homeScore.Value;
        return own > opponent ? "W" : own < opponent ? "L" : "D";
    }

    private static SpotlightTeamMatchDto TeamMatch(
        string kind, int matchId, DateOnly date, string? competition, string label, string? result) => new()
    {
        Kind = kind,
        MatchId = matchId,
        Date = IsoDate(date) ?? string.Empty,
        Competition = competition,
        Label = label,
        Result = result,
    };
}
