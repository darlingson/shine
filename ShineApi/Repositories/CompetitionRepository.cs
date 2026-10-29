using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class CompetitionRepository : ICompetitionRepository
{
    private readonly ShineDbContext _context;

    public CompetitionRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Competition>> GetAllAsync()
        => await _context.Competition.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

    public async Task<(IReadOnlyList<Competition> Items, int Total)> GetPageAsync(CompetitionQuery query)
    {
        var competitions = Filter(_context.Competition.AsNoTracking(), query);
        var total = await competitions.CountAsync();

        var items = await Sort(competitions, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Kinds, IReadOnlyList<int> Tiers, IReadOnlyList<string> Scopes, IReadOnlyList<string> Regions)> GetFilterOptionsAsync()
    {
        var kinds = await _context.Competition
            .Where(c => c.Kind != "")
            .Select(c => c.Kind)
            .Distinct()
            .ToListAsync();

        // Canonical kinds first, then anything unexpected.
        var orderedKinds = kinds
            .OrderBy(k => k.ToLowerInvariant() switch
            {
                "league" => 0,
                "cup" => 1,
                _ => 2
            })
            .ThenBy(k => k)
            .ToList();

        var tiers = await _context.Competition
            .Where(c => c.Tier != null)
            .Select(c => c.Tier!.Value)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync();

        var scopes = await _context.Competition
            .Where(c => c.Scope != null && c.Scope != "")
            .Select(c => c.Scope!)
            .Distinct()
            .ToListAsync();

        // Canonical scopes first, then anything unexpected.
        var orderedScopes = scopes
            .OrderBy(s => s.ToLowerInvariant() switch
            {
                "national" => 0,
                "regional" => 1,
                "continental" => 2,
                "international" => 3,
                _ => 4
            })
            .ThenBy(s => s)
            .ToList();

        var regions = await _context.Competition
            .Where(c => c.Region != null && c.Region != "")
            .Select(c => c.Region!)
            .Distinct()
            .OrderBy(r => r)
            .ToListAsync();

        return (orderedKinds, tiers, orderedScopes, regions);
    }

    public async Task<Competition?> GetByIdAsync(int id)
        => await _context.Competition.FindAsync(id);

    public async Task<Competition> AddAsync(Competition competition)
    {
        await _context.Competition.AddAsync(competition);
        return competition;
    }

    public void Update(Competition competition)
        => _context.Competition.Update(competition);

    public void Delete(Competition competition)
        => _context.Competition.Remove(competition);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Competition.AnyAsync(x => x.CompetitionId == id);

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var normalized = name.Trim().ToLower();
        return await _context.Competition.AnyAsync(x =>
            x.Name.ToLower() == normalized &&
            (excludeId == null || x.CompetitionId != excludeId));
    }

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    // ── Seasons ─────────────────────────────────────────────────────────

    /// <summary>Editions of one competition, newest known first.</summary>
    public async Task<IEnumerable<CompetitionSeason>> GetSeasonsAsync(int competitionId)
        => await _context.CompetitionSeason.AsNoTracking()
            .Where(s => s.CompetitionId == competitionId)
            .OrderByDescending(s => s.StartDate)
            .ThenByDescending(s => s.Label ?? "")
            .ThenByDescending(s => s.SeasonId)
            .ToListAsync();

    /// <summary>Tracked lookup — the caller may mutate the result and save.</summary>
    public async Task<CompetitionSeason?> GetSeasonAsync(int competitionId, int seasonId)
        => await _context.CompetitionSeason
            .FirstOrDefaultAsync(s => s.CompetitionId == competitionId && s.SeasonId == seasonId);

    public async Task<CompetitionSeason> AddSeasonAsync(CompetitionSeason season)
    {
        await _context.CompetitionSeason.AddAsync(season);
        return season;
    }

    public void UpdateSeason(CompetitionSeason season)
        => _context.CompetitionSeason.Update(season);

    public void DeleteSeason(CompetitionSeason season)
        => _context.CompetitionSeason.Remove(season);

    public async Task<bool> SeasonLabelInUseAsync(int competitionId, string label, int? excludeSeasonId = null)
    {
        var normalized = label.Trim().ToLower();
        return await _context.CompetitionSeason.AnyAsync(s =>
            s.CompetitionId == competitionId &&
            s.Label != null &&
            s.Label.ToLower() == normalized &&
            (excludeSeasonId == null || s.SeasonId != excludeSeasonId));
    }

    private static IQueryable<Competition> Filter(IQueryable<Competition> competitions, CompetitionQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            competitions = competitions.Where(c =>
                EF.Functions.ILike(c.Name, pattern)
                || (c.ShortName != null && EF.Functions.ILike(c.ShortName, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(query.Kind))
        {
            var kind = query.Kind.Trim().ToLower();
            competitions = competitions.Where(c => c.Kind.ToLower() == kind);
        }

        if (query.Tier is not null)
            competitions = competitions.Where(c => c.Tier == query.Tier);

        if (!string.IsNullOrWhiteSpace(query.Scope))
        {
            var scope = query.Scope.Trim().ToLower();
            competitions = competitions.Where(c => c.Scope != null && c.Scope.ToLower() == scope);
        }

        if (!string.IsNullOrWhiteSpace(query.Region))
        {
            var region = query.Region.Trim().ToLower();
            competitions = competitions.Where(c => c.Region != null && c.Region.ToLower() == region);
        }

        return competitions;
    }

    private static IQueryable<Competition> Sort(IQueryable<Competition> competitions, CompetitionQuery query)
    {
        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("name" or "kind" or "tier" or "scope" or "region" or "createdat"))
            sort = "name";

        // Missing values sort last in both directions. CompetitionId breaks
        // ties so paging stays stable.
        return ((sort, descending) switch
        {
            ("kind", true) => competitions.OrderBy(c => c.Kind == "").ThenByDescending(c => c.Kind).ThenBy(c => c.Name),
            ("kind", false) => competitions.OrderBy(c => c.Kind == "").ThenBy(c => c.Kind).ThenBy(c => c.Name),
            ("tier", true) => competitions.OrderBy(c => c.Tier == null).ThenByDescending(c => c.Tier).ThenBy(c => c.Name),
            ("tier", false) => competitions.OrderBy(c => c.Tier == null).ThenBy(c => c.Tier).ThenBy(c => c.Name),
            ("scope", true) => competitions.OrderBy(c => c.Scope == null).ThenByDescending(c => c.Scope).ThenBy(c => c.Name),
            ("scope", false) => competitions.OrderBy(c => c.Scope == null).ThenBy(c => c.Scope).ThenBy(c => c.Name),
            ("region", true) => competitions.OrderBy(c => c.Region == null).ThenByDescending(c => c.Region).ThenBy(c => c.Name),
            ("region", false) => competitions.OrderBy(c => c.Region == null).ThenBy(c => c.Region).ThenBy(c => c.Name),
            ("createdat", true) => competitions.OrderByDescending(c => c.CreatedAt),
            ("createdat", false) => competitions.OrderBy(c => c.CreatedAt),
            ("name", true) => competitions.OrderByDescending(c => c.Name),
            _ => competitions.OrderBy(c => c.Name),
        }).ThenBy(c => c.CompetitionId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
