using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Services.Interfaces;
using ApiMatch = ShineApi.Models.Match;

namespace ShineApi.Services;

public partial class MatchRecordService(ShineDbContext db) : IMatchRecordService
{
    private static readonly string[] ValidStatuses =
        ["starter", "substitute", "unused_sub", "reserve", "suspended", "injured"];

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

        var players = await db.Player.ToListAsync();
        var currentAffils = await db.PlayerClub
            .Where(a => a.IsCurrent && (a.ClubId == home.ClubId || a.ClubId == away.ClubId))
            .ToListAsync();

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var match = new ApiMatch
            {
                MatchDate = dto.Match.MatchDate,
                Competition = dto.Match.Competition,
                Season = dto.Match.Season,
                HomeTeam = home.Name,
                AwayTeam = away.Name,
                HomeScore = dto.Match.HomeScore,
                AwayScore = dto.Match.AwayScore,
                Venue = dto.Match.Venue,
                SourceUrl = dto.Match.SourceUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Match.Add(match);
            await db.SaveChangesAsync();

            var result = new MatchRecordResultDto { MatchId = match.MatchId };
            // Same name twice in one payload resolves once — never double-create.
            var resolvedInRequest = new Dictionary<string, (int PlayerId, double Score)>();

            for (var i = 0; i < dto.Squads.Count; i++)
            {
                var row = dto.Squads[i];
                var source = row.SourceUrl ?? dto.Match.SourceUrl;
                var resolution = ResolvePlayer(row, players, currentAffils);

                int playerId;
                string decision;
                string? flag = null;

                if (resolvedInRequest.TryGetValue(Normalize(row.Name), out var prior))
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
                    var created = new Player
                    {
                        FullName = row.Name.Trim(),
                        PositionPrimary = row.Position,
                        Status = "active",
                        SourceUrl = source,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };
                    db.Player.Add(created);
                    await db.SaveChangesAsync();
                    players.Add(created);

                    db.PlayerClub.Add(new PlayerClub
                    {
                        PlayerId = created.PlayerId,
                        ClubId = row.ClubId,
                        IsCurrent = true,
                        PositionAtClub = row.Position,
                        ShirtNumber = row.ShirtNumber,
                        SourceUrl = source,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    });
                    await db.SaveChangesAsync();

                    playerId = created.PlayerId;
                    decision = "created";
                    result.CreatedPlayerIds.Add(playerId);
                    if (resolution.SubstringCandidate)
                        flag = $"Created '{row.Name}' though similar name '{resolution.MatchedName}' exists — please verify.";
                }

                resolvedInRequest[Normalize(row.Name)] = (playerId, resolution.Score);

                db.ClubMatchSquad.Add(new ClubMatchSquad
                {
                    MatchId = match.MatchId,
                    ClubId = row.ClubId,
                    PlayerId = playerId,
                    LineupStatus = row.LineupStatus,
                    ShirtNumber = row.ShirtNumber,
                    Position = row.Position,
                    MinutesPlayed = row.MinutesPlayed,
                    Goals = row.Goals,
                    Assists = row.Assists,
                    YellowCards = row.YellowCards,
                    RedCards = row.RedCards,
                    Captain = row.Captain,
                    SourceUrl = source,
                    Notes = row.Notes,
                });

                var entry = new MatchRecordEntryDto
                {
                    Row = i,
                    PlayerId = playerId,
                    Decision = decision,
                    Score = Math.Round(resolution.Score, 2),
                    Flag = flag,
                };
                result.Entries.Add(entry);

                if (flag is not null)
                {
                    var review = new ReviewFlag
                    {
                        EntityType = "club-match-squad",
                        EntityKey = $"match/{match.MatchId}/club/{row.ClubId}/player/{playerId}",
                        Reason = flag,
                        Score = entry.Score,
                        Status = "open",
                        SourceUrl = source,
                    };
                    db.ReviewFlag.Add(review);
                    await db.SaveChangesAsync();
                    result.ReviewFlags.Add(review);
                }
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return result;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
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
