using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface INationalTeamService
{
    Task<IEnumerable<NationalTeam>> GetAllAsync();
    Task<PagedResult<NationalTeam>> GetPageAsync(NationalTeamQuery query);
    Task<NationalTeamFilterOptionsDto> GetFilterOptionsAsync();
    Task<NationalTeam?> GetByIdAsync(int id);
    Task<NationalTeam?> CreateAsync(CreateNationalTeamDto dto);
    Task<NationalTeam?> UpdateAsync(int id, UpdateNationalTeamDto dto);
    Task<bool> DeleteAsync(int id);
}
