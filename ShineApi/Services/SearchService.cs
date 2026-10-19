using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

/// <summary>
/// Cross-entity keyword search. Each kind is narrowed in SQL so the candidate set stays
/// small, then ranked in memory — which is what lets us reuse the fuzzy name scoring
/// already used to link players when recording a match.
/// </summary>
public class SearchService(ShineDbContext db) : ISearchService
{
    private const int MaxLimit = 50;
    private const int MinTermLength = 2;

    /// <summary>How far a name may differ in length and still be a fuzzy candidate.</summary>
    private const int FuzzyLengthTolerance = 3;

    /// <summary>Score at or above which a fuzzy-only candidate is worth showing.</summary>
    private const double FuzzyFloor = 0.45;

    private const double Exact = 1.0;
    private const double Prefix = 0.85;
    private const double Substring = 0.7;
    private const double FuzzyWeight = 0.6;

    private sealed record Scored<T>(T Item, double Score, SearchResultDto Result);

    public async Task<SearchResponseDto> SearchAsync(string? query, IReadOnlyList<string>? kinds, int limit)
    {
        var raw = (query ?? "").Trim();
        var term = MatchRecordService.Normalize(raw);
        limit = Math.Clamp(limit, 1, MaxLimit);

        var selected = ResolveKinds(kinds);
        if (term.Length < MinTermLength || selected.Count == 0)
            return new SearchResponseDto { Query = raw, Results = [] };

        var results = new List<SearchResultDto>();
        if (selected.Contains(SearchKinds.Player))
            results.AddRange(await SearchPlayersAsync(term, limit));
        if (selected.Contains(SearchKinds.Club))
            results.AddRange(await SearchClubsAsync(term, limit));
        if (selected.Contains(SearchKinds.NationalTeam))
            results.AddRange(await SearchNationalTeamsAsync(term, limit));
        if (selected.Contains(SearchKinds.ClubMatch))
            results.AddRange(await SearchClubMatchesAsync(term, limit));
        if (selected.Contains(SearchKinds.NationalTeamMatch))
            results.AddRange(await SearchNationalTeamMatchesAsync(term, limit));

        return new SearchResponseDto { Query = raw, Results = results };
    }

    private static HashSet<string> ResolveKinds(IReadOnlyList<string>? kinds)
        => kinds is null || kinds.Count == 0
            ? [.. SearchKinds.All]
            : [.. kinds.Where(SearchKinds.IsKnown)];

    private async Task<List<SearchResultDto>> SearchPlayersAsync(string term, int limit)
    {
        var pattern = LikePattern(term);
        var hits = await db.Player
            .Where(p => EF.Functions.ILike(p.FullName, pattern)
                || (p.KnownAs != null && EF.Functions.ILike(p.KnownAs, pattern)))
            .ToListAsync();

        var scored = new Dictionary<int, Scored<Player>>();
        foreach (var s in Rank(hits, p => TextScore(term, p.FullName, p.KnownAs), PlayerResult))
            scored[s.Item.PlayerId] = s;

        // Substring matching never fires for a typo, so top up with fuzzy candidates
        // whenever there is room left in the result set. Names are at least as long as
        // the token we are matching against, which bounds the scan cheaply.
        if (scored.Count < limit)
        {
            var lo = Math.Max(1, term.Length - FuzzyLengthTolerance);
            var pool = await db.Player
                .Where(p => p.FullName.Length >= lo
                    || (p.KnownAs != null && p.KnownAs.Length >= lo))
                .ToListAsync();

            foreach (var s in Rank(pool.Where(p => !scored.ContainsKey(p.PlayerId)),
                    p => TextScore(term, p.FullName, p.KnownAs), PlayerResult, FuzzyFloor))
                scored[s.Item.PlayerId] = s;
        }

        return scored.Values
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.Item.PlayerId)
            .Take(limit)
            .Select(s => s.Result)
            .ToList();
    }

    private async Task<List<SearchResultDto>> SearchClubsAsync(string term, int limit)
    {
        var pattern = LikePattern(term);
        var hits = await db.Club
            .Where(c => EF.Functions.ILike(c.Name, pattern)
                || (c.ShortName != null && EF.Functions.ILike(c.ShortName, pattern))
                || (c.City != null && EF.Functions.ILike(c.City, pattern))
                || EF.Functions.ILike(c.Country, pattern))
            .ToListAsync();

        return Top(Rank(hits, c => TextScore(term, c.Name, c.ShortName, c.City, c.Country), c => new SearchResultDto
        {
            Kind = SearchKinds.Club,
            Id = c.ClubId,
            Title = c.Name,
            Subtitle = string.Join(", ", new[] { c.City, c.Country }
                .Where(s => !string.IsNullOrWhiteSpace(s))),
            Badge = "Club",
        }), limit);
    }

    private async Task<List<SearchResultDto>> SearchNationalTeamsAsync(string term, int limit)
    {
        var pattern = LikePattern(term);
        var hits = await db.NationalTeam
            .Where(n => EF.Functions.ILike(n.Name, pattern)
                || (n.ShortName != null && EF.Functions.ILike(n.ShortName, pattern))
                || (n.Level != null && EF.Functions.ILike(n.Level, pattern))
                || (n.Gender != null && EF.Functions.ILike(n.Gender, pattern))
                || EF.Functions.ILike(n.Country, pattern))
            .ToListAsync();

        return Top(Rank(hits, n => TextScore(term, n.Name, n.ShortName, n.Level, n.Gender, n.Country), n => new SearchResultDto
        {
            Kind = SearchKinds.NationalTeam,
            Id = n.NationalTeamId,
            Title = n.Name,
            Subtitle = string.Join(" · ", new[] { n.Gender, n.Level }
                .Where(s => !string.IsNullOrWhiteSpace(s))),
            Badge = "National team",
        }), limit);
    }

    private async Task<List<SearchResultDto>> SearchClubMatchesAsync(string term, int limit)
    {
        var pattern = LikePattern(term);
        var hits = await db.ClubMatch
            .Include(m => m.HomeClub)
            .Include(m => m.AwayClub)
            .Where(m => EF.Functions.ILike(m.HomeClub!.Name, pattern)
                || EF.Functions.ILike(m.AwayClub!.Name, pattern)
                || (m.Competition != null && EF.Functions.ILike(m.Competition, pattern))
                || (m.Season != null && EF.Functions.ILike(m.Season, pattern))
                || (m.Venue != null && EF.Functions.ILike(m.Venue, pattern)))
            .ToListAsync();

        return Top(Rank(hits,
            m => MatchScore(term, m.HomeClub?.Name, m.AwayClub?.Name, m.Competition, m.Season, m.Venue),
            m => MatchResult(SearchKinds.ClubMatch, m.MatchId,
                MatchLabel(m.HomeClub?.Name, m.AwayClub?.Name, m.HomeScore, m.AwayScore),
                m.MatchDate, m.Competition, m.Venue)), limit);
    }

    private async Task<List<SearchResultDto>> SearchNationalTeamMatchesAsync(string term, int limit)
    {
        var pattern = LikePattern(term);
        var hits = await db.NationalTeamMatch
            .Include(m => m.HomeNationalTeam)
            .Include(m => m.AwayNationalTeam)
            .Where(m => EF.Functions.ILike(m.HomeNationalTeam!.Name, pattern)
                || EF.Functions.ILike(m.AwayNationalTeam!.Name, pattern)
                || (m.Competition != null && EF.Functions.ILike(m.Competition, pattern))
                || (m.Season != null && EF.Functions.ILike(m.Season, pattern))
                || (m.Venue != null && EF.Functions.ILike(m.Venue, pattern)))
            .ToListAsync();

        return Top(Rank(hits,
            m => MatchScore(term, m.HomeNationalTeam?.Name, m.AwayNationalTeam?.Name, m.Competition, m.Season, m.Venue),
            m => MatchResult(SearchKinds.NationalTeamMatch, m.MatchId,
                MatchLabel(m.HomeNationalTeam?.Name, m.AwayNationalTeam?.Name, m.HomeScore, m.AwayScore),
                m.MatchDate, m.Competition, m.Venue)), limit);
    }

    private static SearchResultDto PlayerResult(Player p) => new()
    {
        Kind = SearchKinds.Player,
        Id = p.PlayerId,
        Title = string.IsNullOrWhiteSpace(p.KnownAs) ? p.FullName : p.KnownAs,
        Subtitle = string.Join(" · ", new[] { p.PositionPrimary, p.Status }
            .Where(s => !string.IsNullOrWhiteSpace(s))),
        Badge = "Player",
    };

    private static SearchResultDto MatchResult(
        string kind, int matchId, string title, DateOnly date, string? competition, string? venue) => new()
    {
        Kind = kind,
        Id = matchId,
        Title = title,
        Subtitle = string.Join(" · ", new[]
        {
            date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            competition,
            venue,
        }.Where(s => !string.IsNullOrWhiteSpace(s))),
        Badge = kind == SearchKinds.ClubMatch ? "Club match" : "National match",
    };

    private static List<Scored<T>> Rank<T>(
        IEnumerable<T> items, Func<T, double> score, Func<T, SearchResultDto> project, double floor = 0.0)
        => items
            .Select(i => (Item: i, Score: score(i)))
            .Where(x => x.Score > floor)
            .OrderByDescending(x => x.Score)
            .Select(x => new Scored<T>(x.Item, x.Score, project(x.Item)))
            .ToList();

    private static List<SearchResultDto> Top<T>(List<Scored<T>> scored, int limit)
        => scored.Take(limit).Select(s => s.Result).ToList();

    /// <summary>Best score across the supplied fields: exact, then prefix, then substring, then fuzzy.</summary>
    private static double TextScore(string term, params string?[] fields)
    {
        var best = 0.0;
        foreach (var field in fields)
        {
            if (string.IsNullOrWhiteSpace(field)) continue;
            var value = MatchRecordService.Normalize(field);
            if (value.Length == 0) continue;

            double score;
            if (value == term) score = Exact;
            else if (value.StartsWith(term, StringComparison.Ordinal)) score = Prefix;
            else if (value.Contains(term, StringComparison.Ordinal)) score = Substring;
            else score = FuzzyScore(term, value);

            if (score > best) best = score;
        }
        return best;
    }

    /// <summary>
    /// Fuzzy score compares the term against each word of the value as well as the whole
    /// value. Per-word comparison is what makes a typo in one word of a longer name
    /// (e.g. "mpokra" in "Blessings Mpokera") score, since whole-string length differs.
    /// </summary>
    private static double FuzzyScore(string term, string value)
    {
        var best = Math.Abs(value.Length - term.Length) <= FuzzyLengthTolerance
            ? MatchRecordService.Similarity(term, value) * FuzzyWeight
            : 0.0;

        foreach (var token in value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (Math.Abs(token.Length - term.Length) > FuzzyLengthTolerance) continue;
            var score = MatchRecordService.Similarity(term, token) * FuzzyWeight;
            if (score > best) best = score;
        }
        return best;
    }

    /// <summary>
    /// A match named by one of its sides outranks a match that merely mentions the term in
    /// its competition or venue, so side matches score above 1.
    /// </summary>
    private static double MatchScore(string term, string? home, string? away, params string?[] others)
    {
        var sides = Math.Max(TextScore(term, home), TextScore(term, away));
        return sides > 0 ? 1.0 + sides : TextScore(term, others);
    }

    private static string LikePattern(string term)
        => $"%{term.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";

    private static string MatchLabel(string? home, string? away, int? homeScore, int? awayScore)
    {
        var hasScore = homeScore.HasValue || awayScore.HasValue;
        var score = hasScore ? $"{homeScore?.ToString() ?? "?"}–{awayScore?.ToString() ?? "?"}" : "vs";
        return $"{home ?? "?"} {score} {away ?? "?"}";
    }
}