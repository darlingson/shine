using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IStaffAppointmentRepository
{
    Task<IEnumerable<StaffAppointment>> GetAllAsync();

    /// <summary>All appointments with person and both team names resolved,
    /// for the staff-appointments export.</summary>
    Task<IEnumerable<StaffAppointment>> GetAllForExportAsync();

    Task<(IReadOnlyList<StaffAppointment> Items, int Total)> GetPageAsync(StaffAppointmentQuery query);
    Task<StaffAppointment?> GetByIdAsync(int id);

    /// <summary>Read lookup with the person and both teams resolved — for the
    /// detail/paging read path (names must come back, the caller mutates nothing).</summary>
    Task<StaffAppointment?> GetWithTeamsByIdAsync(int id);

    /// <summary>Duplicate guard: same person + role + team + start date,
    /// used to reject accidental double-entry (different roles may overlap).</summary>
    Task<bool> DuplicateExistsAsync(
        int staffMemberId, string role, int? clubId, int? nationalTeamId,
        DateOnly? startDate, int? excludeId = null);

    /// <summary>Whether the referenced person / team rows exist — the service
    /// validates before persisting.</summary>
    Task<bool> StaffMemberExistsAsync(int staffMemberId);
    Task<bool> ClubExistsAsync(int clubId);
    Task<bool> NationalTeamExistsAsync(int nationalTeamId);

    Task<StaffAppointment> AddAsync(StaffAppointment appointment);
    void Update(StaffAppointment appointment);
    void Delete(StaffAppointment appointment);
    Task SaveChangesAsync();
}
