using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IStaffMemberRepository
{
    Task<IEnumerable<StaffMember>> GetAllAsync();

    /// <summary>All members with the optional player link resolved, for the
    /// staff-members export.</summary>
    Task<IEnumerable<StaffMember>> GetAllForExportAsync();

    Task<(IReadOnlyList<StaffMember> Items, int Total)> GetPageAsync(StaffMemberQuery query);
    Task<IReadOnlyList<string>> GetNationalitiesAsync();
    Task<StaffMember?> GetByIdAsync(int id);
    Task<StaffMember> AddAsync(StaffMember staffMember);
    void Update(StaffMember staffMember);
    void Delete(StaffMember staffMember);
    Task<bool> ExistsAsync(int id);

    /// <summary>Whether the player row a staff member is linked to exists.</summary>
    Task<bool> PlayerExistsAsync(int playerId);

    Task SaveChangesAsync();
}
