using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public partial class MatchRecordService(ShineDbContext db) : IMatchRecordService
{
    private static readonly string[] ValidStatuses = [.. LineupStatuses.StatusesList];

    private const double AutoLinkThreshold = 0.85;
    private const double CreateThreshold = 0.5;
    private const double AmbiguityBand = 0.1;
    private const double SubstringCap = 0.4;
    private const double ClubBoost = 0.15;
    private const double PositionBoost = 0.05;

    public async Task<MatchRecordResultDto?> CreateAsync(CreateMatchRecordDto dto, List<string> errors)
    {
        if (!Validate(dto, errors)) return null;

        var home = await db.Club.FindAsync(dto.Match.HomeClubId);
        var away = await db.Club.FindAsync(dto.Match.AwayClubId);
        if (home is null) errors.Add($"Unknown homeClubId {dto.Match.HomeClubId}.");
        if (away is null) errors.Add($"Unknown awayClubId {dto.Match.AwayClubId}.");
        if (home is null || away is null) return null;
        await ValidateCompetitionLinkAsync(dto.Match.CompetitionId, dto.Match.SeasonId, errors);
        if (errors.Count > 0) return null;

        var players = await db.Player.ToListAsync();
        var currentAffils = await db.PlayerClub
            .Where(a => a.IsCurrent && (a.ClubId == home.ClubId || a.ClubId == away.ClubId))
            .ToListAsync();

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var match = new ClubMatch
            {
                MatchDate = dto.Match.MatchDate,
                Competition = dto.Match.Competition,
                Season = dto.Match.Season,
                CompetitionId = dto.Match.CompetitionId,
                SeasonId = dto.Match.SeasonId,
                HomeClubId = home.ClubId,
                AwayClubId = away.ClubId,
                HomeScore = dto.Match.HomeScore,
                AwayScore = dto.Match.AwayScore,
                Venue = dto.Match.Venue,
                SourceUrl = dto.Match.SourceUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.ClubMatch.Add(match);
            await db.SaveChangesAsync();

            var result = new MatchRecordResultDto { MatchId = match.MatchId };
            var reviews = new List<ReviewFlag>();
            // Same (club, name) twice in one payload resolves once — never double-create.
            var resolvedInRequest = new Dictionary<(int ClubId, string Name), (int PlayerId, double Score)>();
            var seenNames = new HashSet<(int ClubId, string Name)>();
            var outcomes = new List<(MatchRecordSquadRowDto Row, int Index, int PlayerId, string Decision, double Score, string? Flag, Player? Created)>();

            for (var i = 0; i < dto.Squads.Count; i++)
            {
                var row = dto.Squads[i];
                if (!seenNames.Add((row.ClubId, Normalize(row.Name ?? ""))))
                {
                    errors.Add($"Row {i}: '{row.Name}' is already listed for this club.");
                    return null;
                }
                var resolution = ResolvePlayer(row, players, currentAffils);

                int playerId;
                string decision;
                string? flag = null;
                Player? created = null;

                if (resolvedInRequest.TryGetValue((row.ClubId, Normalize(row.Name)), out var prior))
                {
                    playerId = prior.PlayerId;
                    decision = "linked";
                    resolution = new Resolution(prior.PlayerId, prior.Score, null);
                }
                else if (resolution.Score >= AutoLinkThreshold && !resolution.Ambiguous)
                {
                    playerId = resolution.PlayerId;
                    decision = "linked";
                }
                else if (resolution.PlayerId != 0)
                {
                    playerId = resolution.PlayerId;
                    decision = "linked-unverified";
                    flag = $"Linked '{row.Name}' to '{resolution.MatchedName}' " +
                           $"(score {resolution.Score:F2}) — please verify.";
                }
                else
                {
                    created = new Player
                    {
                        FullName = row.Name.Trim(),
                        PositionPrimary = row.Position,
                        Status = "active",
                        SourceUrl = row.SourceUrl ?? dto.Match.SourceUrl,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };
                    db.Player.Add(created);
                    players.Add(created);

                    playerId = 0; // Assigned on SaveChanges below.
                    decision = "created";
                    if (resolution.SubstringCandidate)
                        flag = $"Created '{row.Name}' though similar name '{resolution.MatchedName}' exists — please verify.";
                }

                outcomes.Add((row, i, playerId, decision, resolution.Score, flag, created));
                if (created is null)
                    resolvedInRequest[(row.ClubId, Normalize(row.Name))] = (playerId, resolution.Score);
            }

            await db.SaveChangesAsync();

            // Same player twice for one club in one payload is a data error, not two rows.
            var used = new HashSet<(int ClubId, int PlayerId)>();
            foreach (var o in outcomes)
            {
                var pid = o.Created?.PlayerId ?? o.PlayerId;
                if (o.Created is not null)
                    resolvedInRequest[(o.Row.ClubId, Normalize(o.Row.Name))] = (pid, o.Score);
                if (!used.Add((o.Row.ClubId, pid)))
                {
                    errors.Add($"Row {o.Index}: '{o.Row.Name}' resolves to a player already listed for this club.");
                    return null;
                }
            }

            var source = dto.Match.SourceUrl;
            foreach (var o in outcomes)
            {
                var pid = o.Created?.PlayerId ?? o.PlayerId;
                var rowSource = o.Row.SourceUrl ?? source;
                if (o.Created is not null)
                {
                    db.PlayerClub.Add(new PlayerClub
                    {
                        PlayerId = pid,
                        ClubId = o.Row.ClubId,
                        IsCurrent = true,
                        PositionAtClub = o.Row.Position,
                        ShirtNumber = o.Row.ShirtNumber,
                        SourceUrl = rowSource,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    });
                    result.CreatedPlayerIds.Add(pid);
                }

                db.ClubMatchSquad.Add(new ClubMatchSquad
                {
                    MatchId = match.MatchId,
                    ClubId = o.Row.ClubId,
                    PlayerId = pid,
                    LineupStatus = o.Row.LineupStatus,
                    ShirtNumber = o.Row.ShirtNumber,
                    Position = o.Row.Position,
                    MinutesPlayed = o.Row.MinutesPlayed,
                    Goals = o.Row.Goals,
                    Assists = o.Row.Assists,
                    YellowCards = o.Row.YellowCards,
                    RedCards = o.Row.RedCards,
                    Captain = o.Row.Captain,
                    SourceUrl = rowSource,
                    Notes = o.Row.Notes,
                });

                var entry = new MatchRecordEntryDto
                {
                    Row = o.Index,
                    PlayerId = pid,
                    Decision = o.Decision,
                    Score = Math.Round(o.Score, 2),
                    Flag = o.Flag,
                };
                result.Entries.Add(entry);

                if (o.Flag is not null)
                {
                    var review = new ReviewFlag
                    {
                        EntityType = "club-match-squad",
                        EntityKey = $"match/{match.MatchId}/club/{o.Row.ClubId}/player/{pid}",
                        Reason = o.Flag,
                        Score = entry.Score,
                        Status = "open",
                        SourceUrl = rowSource,
                    };
                    db.ReviewFlag.Add(review);
                    reviews.Add(review);
                }
            }

            await db.SaveChangesAsync();
            result.ReviewFlags = reviews.Select(ReviewFlagDto.From).ToList();
            await tx.CommitAsync();
            return result;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ReviewFlagDto>> GetFlagsAsync(string? status, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.ReviewFlag.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(f => f.Status == status);
        var flags = await query
            .OrderByDescending(f => f.ReviewFlagId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return flags.Select(ReviewFlagDto.From).ToList();
    }

    public async Task<ReviewFlagDto?> ResolveFlagAsync(int id, string status)
    {
        if (!string.Equals(status, "open", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "resolved", StringComparison.OrdinalIgnoreCase))
            return null;
        var flag = await db.ReviewFlag.FindAsync(id);
        if (flag is null) return null;
        flag.Status = status.ToLowerInvariant();
        flag.ResolvedAt = flag.Status == "resolved" ? DateTime.UtcNow : null;
        await db.SaveChangesAsync();
        return ReviewFlagDto.From(flag);
    }

    public async Task<bool> DeleteFlagAsync(int id)
    {
        var flag = await db.ReviewFlag.FindAsync(id);
        if (flag is null) return false;
        db.ReviewFlag.Remove(flag);
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Validates the optional competition/season link on a recorded
    /// match: unknown ids, a season without its competition, or a season from
    /// another competition are all errors.</summary>
    private async Task ValidateCompetitionLinkAsync(int? competitionId, int? seasonId, List<string> errors)
    {
        if (competitionId is null && seasonId is null)
            return;

        if (seasonId is not null && (competitionId is null || competitionId <= 0))
        {
            errors.Add("A seasonId cannot be set without its competitionId.");
            return;
        }

        if (competitionId > 0 && !await db.Competition.AnyAsync(c => c.CompetitionId == competitionId))
            errors.Add($"Unknown competitionId {competitionId}.");

        if (seasonId is not null)
        {
            var season = seasonId > 0
                ? await db.CompetitionSeason.AsNoTracking().FirstOrDefaultAsync(s => s.SeasonId == seasonId)
                : null;
            if (season is null)
                errors.Add($"Unknown seasonId {seasonId}.");
            else if (competitionId is { } cid && season.CompetitionId != cid)
                errors.Add($"Season {seasonId} belongs to competition {season.CompetitionId}, not competition {cid}.");
        }
    }

    private static bool Validate(CreateMatchRecordDto dto, List<string> errors)
    {
        if (dto.Match.HomeClubId == dto.Match.AwayClubId)
            errors.Add("Home and away clubs must differ.");
        for (var i = 0; i < dto.Squads.Count; i++)
        {
            var row = dto.Squads[i];
            if (string.IsNullOrWhiteSpace(row.Name))
                errors.Add($"Row {i}: name is required.");
            if (!ValidStatuses.Contains(row.LineupStatus))
                errors.Add($"Row {i}: unknown lineupStatus '{row.LineupStatus}'.");
            if (row.ClubId != dto.Match.HomeClubId && row.ClubId != dto.Match.AwayClubId)
                errors.Add($"Row {i}: clubId must be the home or away club.");
        }
        return errors.Count == 0;
    }

    private sealed record Resolution(
        int PlayerId, double Score, string? MatchedName,
        bool Ambiguous = false, bool SubstringCandidate = false);

    private static Resolution ResolvePlayer(
        MatchRecordSquadRowDto row,
        List<Player> players,
        List<PlayerClub> currentAffils)
    {
        var name = Normalize(row.Name);
        if (players.Count == 0) return new Resolution(0, 0, null);

        var scored = players
            .Select(p => (Player: p, Score: NameScore(name, p)))
            .Select(x =>
            {
                var score = x.Score;
                if (currentAffils.Any(a => a.PlayerId == x.Player.PlayerId && a.ClubId == row.ClubId))
                    score += ClubBoost;
                if (!string.IsNullOrWhiteSpace(row.Position) &&
                    string.Equals(Normalize(row.Position), Normalize(x.Player.PositionPrimary ?? ""), StringComparison.Ordinal))
                    score += PositionBoost;
                return (x.Player, Score: Math.Min(1.0, score), x.Player.FullName);
            })
            .OrderByDescending(x => x.Score)
            .ToList();

        var best = scored[0];
        var ambiguous = scored.Count > 1 && best.Score - scored[1].Score < AmbiguityBand && best.Score >= CreateThreshold;
        if (best.Score < CreateThreshold)
        {
            var sub = scored.FirstOrDefault(x => IsSubstring(name, x.Player));
            return new Resolution(0, best.Score, sub.Player?.FullName, SubstringCandidate: sub.Player is not null);
        }
        return new Resolution(best.Player.PlayerId, best.Score, best.FullName, Ambiguous: ambiguous);
    }

    private static double NameScore(string name, Player p)
    {
        var candidates = new[] { p.FullName, p.KnownAs }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => Normalize(s!));
        var best = 0.0;
        foreach (var c in candidates)
        {
            double s;
            if (c == name) s = 1.0;
            else if (IsSubstring(name, c)) s = Math.Min(Similarity(name, c), SubstringCap);
            else s = Similarity(name, c);
            best = Math.Max(best, s);
        }
        return best;
    }

    private static bool IsSubstring(string name, Player p)
    {
        var candidates = new[] { p.FullName, p.KnownAs }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => Normalize(s!));
        return candidates.Any(c => c.Contains(name) || name.Contains(c));
    }

    private static bool IsSubstring(string name, string candidate)
        => candidate.Contains(name) || name.Contains(candidate);

    internal static string Normalize(string value)
    {
        var lower = value.Trim().ToLowerInvariant();
        lower = Punctuation().Replace(lower, "");
        return Whitespace().Replace(lower, " ");
    }

    internal static double Similarity(string a, string b)
    {
        if (a == b) return 1.0;
        if (a.Length == 0 || b.Length == 0) return 0.0;
        var dist = Levenshtein(a, b);
        return 1.0 - (double)dist / Math.Max(a.Length, b.Length);
    }

    internal static int Levenshtein(string a, string b)
    {
        var d = new int[a.Length + 1, b.Length + 1];
        for (var i = 0; i <= a.Length; i++) d[i, 0] = i;
        for (var j = 0; j <= b.Length; j++) d[0, j] = j;
        for (var i = 1; i <= a.Length; i++)
            for (var j = 1; j <= b.Length; j++)
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1));
        return d[a.Length, b.Length];
    }

    [GeneratedRegex(@"[''.\-_/\\()]+")]
    private static partial Regex Punctuation();

    [GeneratedRegex(@"\s+")]
    private static partial Regex Whitespace();
}
