using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class NationalTeamRepository : INationalTeamRepository
{
    private readonly ShineDbContext _context;

    public NationalTeamRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NationalTeam>> GetAllAsync()
        => await _context.NationalTeam.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

    public async Task<(IReadOnlyList<NationalTeam> Items, int Total)> GetPageAsync(NationalTeamQuery query)
    {
        var teams = Filter(_context.NationalTeam.AsNoTracking(), query);
        var total = await teams.CountAsync();

        var items = await Sort(teams, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Countries, IReadOnlyList<string> Genders, IReadOnlyList<string> Levels)> GetFilterOptionsAsync()
    {
        var countries = await _context.NationalTeam
            .Where(t => t.Country != "")
            .Select(t => t.Country)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        var genders = await _context.NationalTeam
            .Where(t => t.Gender != null && t.Gender != "")
            .Select(t => t.Gender!)
            .Distinct()
            .OrderBy(g => g)
            .ToListAsync();

        var levels = await _context.NationalTeam
            .Where(t => t.Level != null && t.Level != "")
            .Select(t => t.Level!)
            .Distinct()
            .ToListAsync();

        // Senior first, then the youth levels, then anything unexpected.
        var orderedLevels = levels
            .OrderBy(l => l.ToLowerInvariant() switch
            {
                "senior" => 0,
                "u23" => 1,
                "u20" => 2,
                "u17" => 3,
                _ => 4
            })
            .ThenBy(l => l)
            .ToList();

        return (countries, genders, orderedLevels);
    }

    public async Task<NationalTeam?> GetByIdAsync(int id)
        => await _context.NationalTeam.FindAsync(id);

    public async Task<NationalTeam> AddAsync(NationalTeam nationalTeam)
    {
        await _context.NationalTeam.AddAsync(nationalTeam);
        return nationalTeam;
    }

    public void Update(NationalTeam nationalTeam)
        => _context.NationalTeam.Update(nationalTeam);

    public void Delete(NationalTeam nationalTeam)
        => _context.NationalTeam.Remove(nationalTeam);

    public async Task<bool> ExistsAsync(int id)
        => await _context.NationalTeam.AnyAsync(x => x.NationalTeamId == id);

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var normalized = name.Trim().ToLower();
        return await _context.NationalTeam.AnyAsync(x =>
            x.Name.ToLower() == normalized &&
            (excludeId == null || x.NationalTeamId != excludeId));
    }

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<NationalTeam> Filter(IQueryable<NationalTeam> teams, NationalTeamQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            teams = teams.Where(t =>
                EF.Functions.ILike(t.Name, pattern)
                || (t.ShortName != null && EF.Functions.ILike(t.ShortName, pattern))
                || (t.Nickname != null && EF.Functions.ILike(t.Nickname, pattern))
                || (t.Coach != null && EF.Functions.ILike(t.Coach, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(query.Country))
        {
            var country = query.Country.Trim().ToLower();
            teams = teams.Where(t => t.Country.ToLower() == country);
        }

        if (!string.IsNullOrWhiteSpace(query.Gender))
            teams = teams.Where(t => t.Gender == query.Gender);

        if (!string.IsNullOrWhiteSpace(query.Level))
            teams = teams.Where(t => t.Level == query.Level);

        return teams;
    }

    private static IQueryable<NationalTeam> Sort(IQueryable<NationalTeam> teams, NationalTeamQuery query)
    {
        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("name" or "country" or "level" or "gender" or "createdat"))
            sort = "name";

        // Missing values sort last in both directions. NationalTeamId breaks ties
        // so paging stays stable.
        return ((sort, descending) switch
        {
            ("country", true) => teams.OrderBy(t => t.Country == "").ThenByDescending(t => t.Country).ThenBy(t => t.Name),
            ("country", false) => teams.OrderBy(t => t.Country == "").ThenBy(t => t.Country).ThenBy(t => t.Name),
            ("level", true) => teams.OrderBy(t => t.Level == null)
                .ThenByDescending(t => t.Level == null ? 5
                    : t.Level.ToLower() == "senior" ? 0
                    : t.Level.ToLower() == "u23" ? 1
                    : t.Level.ToLower() == "u20" ? 2
                    : t.Level.ToLower() == "u17" ? 3
                    : 4)
                .ThenBy(t => t.Name),
            ("level", false) => teams.OrderBy(t => t.Level == null)
                .ThenBy(t => t.Level == null ? 5
                    : t.Level.ToLower() == "senior" ? 0
                    : t.Level.ToLower() == "u23" ? 1
                    : t.Level.ToLower() == "u20" ? 2
                    : t.Level.ToLower() == "u17" ? 3
                    : 4)
                .ThenBy(t => t.Name),
            ("gender", true) => teams.OrderBy(t => t.Gender == null).ThenByDescending(t => t.Gender).ThenBy(t => t.Name),
            ("gender", false) => teams.OrderBy(t => t.Gender == null).ThenBy(t => t.Gender).ThenBy(t => t.Name),
            ("createdat", true) => teams.OrderByDescending(t => t.CreatedAt),
            ("createdat", false) => teams.OrderBy(t => t.CreatedAt),
            ("name", true) => teams.OrderByDescending(t => t.Name),
            _ => teams.OrderBy(t => t.Name),
        }).ThenBy(t => t.NationalTeamId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
