using Microsoft.EntityFrameworkCore;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class StaffAppointmentRepository : IStaffAppointmentRepository
{
    private readonly ShineDbContext _context;

    public StaffAppointmentRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StaffAppointment>> GetAllAsync()
        => await _context.StaffAppointment.AsNoTracking()
            .OrderByDescending(a => a.StartDate)
            .ThenBy(a => a.StaffAppointmentId)
            .ToListAsync();

    public async Task<StaffAppointment?> GetWithTeamsByIdAsync(int id)
        => await _context.StaffAppointment.AsNoTracking()
            .Include(a => a.StaffMember)
            .Include(a => a.Club)
            .Include(a => a.NationalTeam)
            .FirstOrDefaultAsync(a => a.StaffAppointmentId == id);

    public async Task<(IReadOnlyList<StaffAppointment> Items, int Total)> GetPageAsync(
        StaffAppointmentQuery query)
    {
        var appointments = Filter(
            _context.StaffAppointment
                .AsNoTracking()
                .Include(a => a.StaffMember)
                .Include(a => a.Club)
                .Include(a => a.NationalTeam),
            query);
        var total = await appointments.CountAsync();

        var items = await Sort(appointments, query)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<StaffAppointment?> GetByIdAsync(int id)
        => await _context.StaffAppointment.FindAsync(id);

    public async Task<bool> DuplicateExistsAsync(
        int staffMemberId, string role, int? clubId, int? nationalTeamId,
        DateOnly? startDate, int? excludeId = null)
    {
        var normalized = role.Trim().ToLower();
        return await _context.StaffAppointment.AnyAsync(a =>
            a.StaffMemberId == staffMemberId &&
            a.Role.ToLower() == normalized &&
            (excludeId == null || a.StaffAppointmentId != excludeId) &&
            (startDate == null
                ? a.StartDate == null
                : a.StartDate == startDate) &&
            (clubId == null
                ? a.ClubId == null
                : a.ClubId == clubId) &&
            (nationalTeamId == null
                ? a.NationalTeamId == null
                : a.NationalTeamId == nationalTeamId));
    }

    public async Task<bool> StaffMemberExistsAsync(int staffMemberId)
        => await _context.StaffMember.AnyAsync(x => x.StaffMemberId == staffMemberId);

    public async Task<bool> ClubExistsAsync(int clubId)
        => await _context.Club.AnyAsync(x => x.ClubId == clubId);

    public async Task<bool> NationalTeamExistsAsync(int nationalTeamId)
        => await _context.NationalTeam.AnyAsync(x => x.NationalTeamId == nationalTeamId);

    public async Task<StaffAppointment> AddAsync(StaffAppointment appointment)
    {
        await _context.StaffAppointment.AddAsync(appointment);
        return appointment;
    }

    public void Update(StaffAppointment appointment)
        => _context.StaffAppointment.Update(appointment);

    public void Delete(StaffAppointment appointment)
        => _context.StaffAppointment.Remove(appointment);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    private static IQueryable<StaffAppointment> Filter(
        IQueryable<StaffAppointment> appointments, StaffAppointmentQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = $"%{EscapeLike(query.Q.Trim())}%";
            appointments = appointments.Where(a =>
                EF.Functions.ILike(a.StaffMember!.FullName, pattern)
                || (a.StaffMember!.KnownAs != null && EF.Functions.ILike(a.StaffMember!.KnownAs, pattern))
                || (a.Club != null && EF.Functions.ILike(a.Club.Name, pattern))
                || (a.NationalTeam != null && EF.Functions.ILike(a.NationalTeam.Name, pattern)));
        }

        if (query.StaffMemberId is not null)
            appointments = appointments.Where(a => a.StaffMemberId == query.StaffMemberId);

        if (query.ClubId is not null)
            appointments = appointments.Where(a => a.ClubId == query.ClubId);

        if (query.NationalTeamId is not null)
            appointments = appointments.Where(a => a.NationalTeamId == query.NationalTeamId);

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            var role = query.Role.Trim().ToLower().Replace(' ', '_').Replace('-', '_');
            appointments = appointments.Where(a => a.Role.ToLower() == role);
        }

        if (query.Ongoing is true)
            appointments = appointments.Where(a => a.EndDate == null);
        else if (query.Ongoing is false)
            appointments = appointments.Where(a => a.EndDate != null);

        return appointments;
    }

    private static IQueryable<StaffAppointment> Sort(
        IQueryable<StaffAppointment> appointments, StaffAppointmentQuery query)
    {
        var sort = query.Sort?.Trim().ToLowerInvariant();
        if (sort is not ("startdate" or "role" or "createdat"))
            sort = "startdate";

        var descending = string.Equals(query.Order, "desc", StringComparison.OrdinalIgnoreCase) ||
                         (query.Order is null && sort == "startdate");

        // Null start dates sort last; ids break ties so paging stays stable.
        return ((sort, descending) switch
        {
            ("role", true) => appointments
                .OrderBy(a => a.Role == "")
                .ThenByDescending(a => a.Role)
                .ThenBy(a => a.StartDate == null),
            ("role", false) => appointments
                .OrderBy(a => a.Role == "")
                .ThenBy(a => a.Role)
                .ThenBy(a => a.StartDate == null),
            ("createdat", true) => appointments
                .OrderByDescending(a => a.CreatedAt),
            ("createdat", false) => appointments
                .OrderBy(a => a.CreatedAt),
            ("startdate", true) => appointments
                .OrderBy(a => a.StartDate == null)
                .ThenByDescending(a => a.StartDate),
            _ => appointments
                .OrderBy(a => a.StartDate == null)
                .ThenBy(a => a.StartDate),
        }).ThenBy(a => a.StaffAppointmentId);
    }

    private static string EscapeLike(string value)
        => value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
