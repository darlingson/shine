using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class ClubMatchRepository : IClubMatchRepository
{
    private readonly ShineDbContext _context;

    public ClubMatchRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClubMatch>> GetAllAsync()
        => await _context.ClubMatch
            .Include(x => x.HomeClub)
            .Include(x => x.AwayClub)
            .AsNoTracking()
            .ToListAsync();

    public async Task<(IReadOnlyList<ClubMatch> Items, int Total)> GetPageAsync(ClubMatchQuery query)
    {
        var matches = Filter(_context.ClubMatch.AsNoTracking(), query);
        var total = await matches.CountAsync();

        var items = await Sort(matches, query)
            .Include(m => m.HomeClub)
            .Include(m => m.AwayClub)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Competitions, IReadOnlyList<string> Seasons)> GetFilterOptionsAsync()
        => (
            await DistinctValuesAsync(_context.ClubMatch.Select(m => m.Competition)),
            await DistinctValuesAsync(_context.ClubMatch.Select(m => m.Season))
        );

    public async Task<ClubMatch?> GetByIdAsync(int id)
        => await _context.ClubMatch
            .Include(x => x.HomeClub)
            .Include(x => x.AwayClub)
            .FirstOrDefaultAsync(x => x.MatchId == id);

    public async Task<ClubMatch> AddAsync(ClubMatch match)
    {
        await _context.ClubMatch.AddAsync(match);
        return match;
    }

    public void Update(ClubMatch match)
        => _context.ClubMatch.Update(match);

    public void Delete(ClubMatch match)
        => _context.ClubMatch.Remove(match);

    public async Task<bool> ExistsAsync(int id)
        => await _context.ClubMatch.AnyAsync(x => x.MatchId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<ClubMatch> Filter(IQueryable<ClubMatch> matches, ClubMatchQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            matches = matches.Where(m =>
                (m.HomeClub != null && EF.Functions.ILike(m.HomeClub.Name, pattern))
                || (m.AwayClub != null && EF.Functions.ILike(m.AwayClub.Name, pattern))
                || (m.Competition != null && EF.Functions.ILike(m.Competition, pattern))
                || (m.Season != null && EF.Functions.ILike(m.Season, pattern))
                || (m.Venue != null && EF.Functions.ILike(m.Venue, pattern)));
        }

        if (query.ClubId is { } clubId)
            matches = matches.Where(m => m.HomeClubId == clubId || m.AwayClubId == clubId);

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

    private static IQueryable<ClubMatch> Sort(IQueryable<ClubMatch> matches, ClubMatchQuery query)
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
