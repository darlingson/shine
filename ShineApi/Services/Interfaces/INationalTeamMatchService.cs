using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface INationalTeamMatchService
{
    Task<IEnumerable<NationalTeamMatchDto>> GetAllAsync();
    Task<NationalTeamMatchDto?> GetByIdAsync(int id);
    Task<NationalTeamMatchDto> CreateAsync(CreateNationalTeamMatchDto dto);
    Task<NationalTeamMatchDto?> UpdateAsync(int id, UpdateNationalTeamMatchDto dto);
    Task<NationalTeamMatchDto?> LinkTeamsAsync(int id, LinkNationalTeamMatchTeamsDto dto);
    Task<bool> DeleteAsync(int id);
}
