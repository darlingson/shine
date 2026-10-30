using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IStaffAppointmentService
{
    Task<IEnumerable<StaffAppointmentDto>> GetAllAsync();
    Task<PagedResult<StaffAppointmentDto>> GetPageAsync(StaffAppointmentQuery query);
    Task<StaffAppointmentDto?> GetByIdAsync(int id);
    Task<StaffAppointment?> CreateAsync(CreateStaffAppointmentDto dto, List<string> errors);
    Task<StaffAppointment?> UpdateAsync(int id, UpdateStaffAppointmentDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);

    /// <summary>Every appointment as a CSV or JSON download, person and team
    /// names resolved beside each row.</summary>
    Task<ExportFile?> ExportAsync(string format);
}
