using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IStaffAppointmentService
{
    Task<IEnumerable<StaffAppointment>> GetAllAsync();
    Task<PagedResult<StaffAppointmentDto>> GetPageAsync(StaffAppointmentQuery query);
    Task<StaffAppointmentDto?> GetByIdAsync(int id);
    Task<StaffAppointment?> CreateAsync(CreateStaffAppointmentDto dto, List<string> errors);
    Task<StaffAppointment?> UpdateAsync(int id, UpdateStaffAppointmentDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
}
