using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class ClubRepository : IClubRepository
{
    private readonly ShineDbContext _context;

    public ClubRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Club>> GetAllAsync()
        => await _context.Club.AsNoTracking().ToListAsync();

    public async Task<(IReadOnlyList<Club> Items, int Total)> GetPageAsync(ClubQuery query)
    {
        var clubs = Filter(_context.Club.AsNoTracking(), query);
        var total = await clubs.CountAsync();

        var items = await Sort(clubs, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Cities, IReadOnlyList<string> Countries)> GetFilterOptionsAsync()
    {
        var cities = await _context.Club
            .Where(c => c.City != null && c.City != "")
            .Select(c => c.City!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        var countries = await _context.Club
            .Select(c => c.Country)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return (cities, countries);
    }

    public async Task<Club?> GetByIdAsync(int id)
        => await _context.Club.FindAsync(id);

    public async Task<Club> AddAsync(Club club)
    {
        await _context.Club.AddAsync(club);
        return club;
    }

    public void Update(Club club)
        => _context.Club.Update(club);

    public void Delete(Club club)
        => _context.Club.Remove(club);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Club.AnyAsync(x => x.ClubId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<Club> Filter(IQueryable<Club> clubs, ClubQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            clubs = clubs.Where(c =>
                EF.Functions.ILike(c.Name, pattern)
                || (c.ShortName != null && EF.Functions.ILike(c.ShortName, pattern))
                || (c.City != null && EF.Functions.ILike(c.City, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(query.City))
            clubs = clubs.Where(c => c.City == query.City);

        if (!string.IsNullOrWhiteSpace(query.Country))
            clubs = clubs.Where(c => c.Country == query.Country);

        if (query.FoundedFrom is { } from)
            clubs = clubs.Where(c => c.FoundedYear != null && c.FoundedYear >= from);

        if (query.FoundedTo is { } to)
            clubs = clubs.Where(c => c.FoundedYear != null && c.FoundedYear <= to);

        return clubs;
    }

    private static IQueryable<Club> Sort(IQueryable<Club> clubs, ClubQuery query)
    {
        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("name" or "city" or "country" or "foundedyear" or "createdat"))
            sort = "name";

        // Missing values sort last in both directions, so unset cities and founding years
        // don't lead the list. ClubId breaks ties to keep paging stable.
        return ((sort, descending) switch
        {
            ("city", true) => clubs.OrderBy(c => c.City == null).ThenByDescending(c => c.City),
            ("city", false) => clubs.OrderBy(c => c.City == null).ThenBy(c => c.City),
            ("country", true) => clubs.OrderByDescending(c => c.Country).ThenByDescending(c => c.Name),
            ("country", false) => clubs.OrderBy(c => c.Country).ThenBy(c => c.Name),
            ("foundedyear", true) => clubs.OrderBy(c => c.FoundedYear == null).ThenByDescending(c => c.FoundedYear),
            ("foundedyear", false) => clubs.OrderBy(c => c.FoundedYear == null).ThenBy(c => c.FoundedYear),
            ("createdat", true) => clubs.OrderByDescending(c => c.CreatedAt),
            ("createdat", false) => clubs.OrderBy(c => c.CreatedAt),
            ("name", true) => clubs.OrderByDescending(c => c.Name),
            _ => clubs.OrderBy(c => c.Name),
        }).ThenBy(c => c.ClubId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
