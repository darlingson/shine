using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class StaffMemberRepository : IStaffMemberRepository
{
    private readonly ShineDbContext _context;

    public StaffMemberRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StaffMember>> GetAllAsync()
        => await _context.StaffMember.AsNoTracking().OrderBy(x => x.FullName).ToListAsync();

    public async Task<(IReadOnlyList<StaffMember> Items, int Total)> GetPageAsync(StaffMemberQuery query)
    {
        var members = Filter(_context.StaffMember.AsNoTracking(), query);
        var total = await members.CountAsync();

        var items = await Sort(members, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IReadOnlyList<string>> GetNationalitiesAsync()
        => await _context.StaffMember
            .Select(x => x.Nationality)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

    public async Task<StaffMember?> GetByIdAsync(int id)
        => await _context.StaffMember.FindAsync(id);

    public async Task<StaffMember> AddAsync(StaffMember staffMember)
    {
        await _context.StaffMember.AddAsync(staffMember);
        return staffMember;
    }

    public void Update(StaffMember staffMember)
        => _context.StaffMember.Update(staffMember);

    public void Delete(StaffMember staffMember)
        => _context.StaffMember.Remove(staffMember);

    public async Task<bool> ExistsAsync(int id)
        => await _context.StaffMember.AnyAsync(x => x.StaffMemberId == id);

    public async Task<bool> PlayerExistsAsync(int playerId)
        => await _context.Player.AnyAsync(x => x.PlayerId == playerId);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<StaffMember> Filter(IQueryable<StaffMember> members, StaffMemberQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            members = members.Where(m =>
                EF.Functions.ILike(m.FullName, pattern)
                || (m.KnownAs != null && EF.Functions.ILike(m.KnownAs, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(query.Nationality))
        {
            var nationality = query.Nationality.Trim();
            members = members.Where(m => m.Nationality == nationality);
        }

        // "Has served this team" — any appointment at it, ongoing or past.
        if (query.ClubId is not null)
            members = members.Where(m =>
                m.Appointments!.Any(a => a.ClubId == query.ClubId));

        if (query.NationalTeamId is not null)
            members = members.Where(m =>
                m.Appointments!.Any(a => a.NationalTeamId == query.NationalTeamId));

        return members;
    }

    private static IQueryable<StaffMember> Sort(IQueryable<StaffMember> members, StaffMemberQuery query)
    {
        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase);
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("name" or "nationality" or "createdat"))
            sort = "name";

        return ((sort, descending) switch
        {
            ("nationality", true) => members.OrderByDescending(m => m.Nationality).ThenBy(m => m.FullName),
            ("nationality", false) => members.OrderBy(m => m.Nationality).ThenBy(m => m.FullName),
            ("createdat", true) => members.OrderByDescending(m => m.CreatedAt),
            ("createdat", false) => members.OrderBy(m => m.CreatedAt),
            ("name", true) => members.OrderByDescending(m => m.FullName),
            _ => members.OrderBy(m => m.FullName),
        }).ThenBy(m => m.StaffMemberId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
