using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class NationalTeamMatchRepository : INationalTeamMatchRepository
{
    private readonly ShineDbContext _context;

    public NationalTeamMatchRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NationalTeamMatch>> GetAllAsync()
        => await _context.NationalTeamMatch
            .Include(x => x.HomeNationalTeam)
            .Include(x => x.AwayNationalTeam)
            .Include(x => x.CompetitionRef)
            .Include(x => x.SeasonRef)
            .AsNoTracking()
            .ToListAsync();

    public async Task<(IReadOnlyList<NationalTeamMatch> Items, int Total)> GetPageAsync(NationalTeamMatchQuery query)
    {
        var matches = Filter(_context.NationalTeamMatch.AsNoTracking(), query);
        var total = await matches.CountAsync();

        var items = await Sort(matches, query)
            .Include(m => m.HomeNationalTeam)
            .Include(m => m.AwayNationalTeam)
            .Include(m => m.CompetitionRef)
            .Include(m => m.SeasonRef)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Competitions, IReadOnlyList<string> Seasons)> GetFilterOptionsAsync()
        => (
            await DistinctValuesAsync(_context.NationalTeamMatch.Select(m => m.Competition)),
            await DistinctValuesAsync(_context.NationalTeamMatch.Select(m => m.Season))
        );

    public async Task<NationalTeamMatch?> GetByIdAsync(int id)
        => await _context.NationalTeamMatch
            .Include(x => x.HomeNationalTeam)
            .Include(x => x.AwayNationalTeam)
            .Include(x => x.CompetitionRef)
            .Include(x => x.SeasonRef)
            .FirstOrDefaultAsync(x => x.MatchId == id);

    public async Task<NationalTeamMatch> AddAsync(NationalTeamMatch match)
    {
        await _context.NationalTeamMatch.AddAsync(match);
        return match;
    }

    public void Update(NationalTeamMatch match)
        => _context.NationalTeamMatch.Update(match);

    public void Delete(NationalTeamMatch match)
        => _context.NationalTeamMatch.Remove(match);

    public async Task<bool> ExistsAsync(int id)
        => await _context.NationalTeamMatch.AnyAsync(x => x.MatchId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<NationalTeamMatch> Filter(
        IQueryable<NationalTeamMatch> matches,
        NationalTeamMatchQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            matches = matches.Where(m =>
                (m.HomeNationalTeam != null && EF.Functions.ILike(m.HomeNationalTeam.Name, pattern))
                || (m.AwayNationalTeam != null && EF.Functions.ILike(m.AwayNationalTeam.Name, pattern))
                || (m.Competition != null && EF.Functions.ILike(m.Competition, pattern))
                || (m.Season != null && EF.Functions.ILike(m.Season, pattern))
                || (m.Venue != null && EF.Functions.ILike(m.Venue, pattern)));
        }

        if (query.NationalTeamId is { } teamId)
            matches = matches.Where(m => m.HomeNationalTeamId == teamId || m.AwayNationalTeamId == teamId);

        if (query.CompetitionId is { } competitionId)
            matches = matches.Where(m => m.CompetitionId == competitionId);

        if (query.SeasonId is { } seasonId)
            matches = matches.Where(m => m.SeasonId == seasonId);

        if (!string.IsNullOrWhiteSpace(query.Competition))
            matches = matches.Where(m => m.Competition == query.Competition);

        if (!string.IsNullOrWhiteSpace(query.Season))
            matches = matches.Where(m => m.Season == query.Season);

        if (query.DateFrom is { } from)
            matches = matches.Where(m => m.MatchDate >= from);

        if (query.DateTo is { } to)
            matches = matches.Where(m => m.MatchDate <= to);

        return matches;
    }

    private static IQueryable<NationalTeamMatch> Sort(
        IQueryable<NationalTeamMatch> matches,
        NationalTeamMatchQuery query)
    {
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("matchdate" or "competition" or "venue" or "createdat"))
            sort = "matchdate";

        // Newest first is the useful default for a match list; explicit order always wins.
        var descending = query.Order is null
            ? sort == "matchdate"
            : string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);

        // Missing values sort last in both directions. MatchId breaks ties so paging stays stable.
        return ((sort, descending) switch
        {
            ("competition", true) => matches.OrderBy(m => m.Competition == null).ThenByDescending(m => m.Competition),
            ("competition", false) => matches.OrderBy(m => m.Competition == null).ThenBy(m => m.Competition),
            ("venue", true) => matches.OrderBy(m => m.Venue == null).ThenByDescending(m => m.Venue),
            ("venue", false) => matches.OrderBy(m => m.Venue == null).ThenBy(m => m.Venue),
            ("createdat", true) => matches.OrderByDescending(m => m.CreatedAt),
            ("createdat", false) => matches.OrderBy(m => m.CreatedAt),
            ("matchdate", true) => matches.OrderByDescending(m => m.MatchDate),
            _ => matches.OrderBy(m => m.MatchDate),
        }).ThenBy(m => m.MatchId);
    }

    private static async Task<List<string>> DistinctValuesAsync(IQueryable<string?> values)
        => await values
            .Where(value => value != null && value != "")
            .Select(value => value!)
            .Distinct()
            .OrderBy(value => value)
            .ToListAsync();

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
