using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly ShineDbContext _context;

    public PlayerRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Player>> GetAllAsync()
        => await _context.Player.AsNoTracking().ToListAsync();

    public async Task<(IReadOnlyList<Player> Items, int Total)> GetPageAsync(PlayerQuery query)
    {
        var players = Filter(_context.Player.AsNoTracking(), query);
        var total = await players.CountAsync();

        var items = await Sort(players, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<string> Nationalities, IReadOnlyList<string> Positions)> GetFilterOptionsAsync()
    {
        var nationalities = await _context.Player
            .Select(p => p.Nationality)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();

        var positions = await _context.Player
            .Where(p => p.PositionPrimary != null && p.PositionPrimary != "")
            .Select(p => p.PositionPrimary!)
            .Union(_context.Player
                .Where(p => p.PositionSecondary != null && p.PositionSecondary != "")
                .Select(p => p.PositionSecondary!))
            .OrderBy(p => p)
            .ToListAsync();

        return (nationalities, positions);
    }

    public async Task<Player?> GetByIdAsync(int id)
        => await _context.Player.FindAsync(id);

    public async Task<Player> AddAsync(Player player)
    {
        await _context.Player.AddAsync(player);
        return player;
    }

    public void Update(Player player)
        => _context.Player.Update(player);

    public void Delete(Player player)
        => _context.Player.Remove(player);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Player.AnyAsync(x => x.PlayerId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<Player> Filter(IQueryable<Player> players, PlayerQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            players = players.Where(p =>
                EF.Functions.ILike(p.FullName, pattern)
                || (p.KnownAs != null && EF.Functions.ILike(p.KnownAs, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
            players = players.Where(p => p.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Foot))
            players = players.Where(p => p.Foot == query.Foot);

        if (!string.IsNullOrWhiteSpace(query.Nationality))
            players = players.Where(p => p.Nationality == query.Nationality);

        // A position filter matches granular codes ("CB") and the generic
        // buckets ("DF") — checking the role columns covers both.
        if (!string.IsNullOrWhiteSpace(query.Position))
            players = players.Where(p =>
                p.PositionPrimary == query.Position
                || p.PrimaryRole == query.Position
                || p.PositionSecondary == query.Position
                || p.SecondaryRole == query.Position);

        // Compare whole dates rather than extracting the year, so the predicate stays
        // a plain range on the column.
        if (query.BornFrom is { } bornFrom)
        {
            var firstOfYear = new DateOnly(bornFrom, 1, 1);
            players = players.Where(p => p.DateOfBirth != null && p.DateOfBirth >= firstOfYear);
        }

        if (query.BornTo is { } bornTo)
        {
            var lastOfYear = new DateOnly(bornTo, 12, 31);
            players = players.Where(p => p.DateOfBirth != null && p.DateOfBirth <= lastOfYear);
        }

        return players;
    }

    private static IQueryable<Player> Sort(IQueryable<Player> players, PlayerQuery query)
    {
        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("name" or "knownas" or "dateofbirth" or "heightcm" or "status" or "createdat"))
            sort = "name";

        // Missing values sort last in both directions. PlayerId breaks ties so paging stays stable.
        return ((sort, descending) switch
        {
            ("knownas", true) => players.OrderBy(p => p.KnownAs == null).ThenByDescending(p => p.KnownAs),
            ("knownas", false) => players.OrderBy(p => p.KnownAs == null).ThenBy(p => p.KnownAs),
            ("dateofbirth", true) => players.OrderBy(p => p.DateOfBirth == null).ThenByDescending(p => p.DateOfBirth),
            ("dateofbirth", false) => players.OrderBy(p => p.DateOfBirth == null).ThenBy(p => p.DateOfBirth),
            ("heightcm", true) => players.OrderBy(p => p.HeightCm == null).ThenByDescending(p => p.HeightCm),
            ("heightcm", false) => players.OrderBy(p => p.HeightCm == null).ThenBy(p => p.HeightCm),
            ("status", true) => players.OrderByDescending(p => p.Status).ThenByDescending(p => p.FullName),
            ("status", false) => players.OrderBy(p => p.Status).ThenBy(p => p.FullName),
            ("createdat", true) => players.OrderByDescending(p => p.CreatedAt),
            ("createdat", false) => players.OrderBy(p => p.CreatedAt),
            ("name", true) => players.OrderByDescending(p => p.FullName),
            _ => players.OrderBy(p => p.FullName),
        }).ThenBy(p => p.PlayerId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
