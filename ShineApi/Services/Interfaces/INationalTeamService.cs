using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface INationalTeamService
{
    Task<IEnumerable<NationalTeam>> GetAllAsync();
    Task<PagedResult<NationalTeam>> GetPageAsync(NationalTeamQuery query);
    Task<NationalTeamFilterOptionsDto> GetFilterOptionsAsync();
    Task<NationalTeam?> GetByIdAsync(int id);
    Task<NationalTeam?> CreateAsync(CreateNationalTeamDto dto, List<string> errors);
    Task<NationalTeam?> UpdateAsync(int id, UpdateNationalTeamDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
    Task<ExportFile?> ExportAsync(string format);
}
