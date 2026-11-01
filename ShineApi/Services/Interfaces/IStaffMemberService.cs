using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IStaffMemberService
{
    Task<IEnumerable<StaffMember>> GetAllAsync();
    Task<PagedResult<StaffMember>> GetPageAsync(StaffMemberQuery query);
    Task<StaffMemberFilterOptionsDto> GetFilterOptionsAsync();
    Task<StaffMember?> GetByIdAsync(int id);
    Task<StaffMember?> CreateAsync(CreateStaffMemberDto dto, List<string> errors);
    Task<StaffMember?> UpdateAsync(int id, UpdateStaffMemberDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);

    /// <summary>Full staff list as a CSV or JSON download, player link
    /// resolved beside each row.</summary>
    Task<ExportFile?> ExportAsync(string format);
}
