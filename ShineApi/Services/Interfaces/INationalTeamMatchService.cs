using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface INationalTeamMatchService
{
    Task<IEnumerable<NationalTeamMatchDto>> GetAllAsync();
    Task<PagedResult<NationalTeamMatchDto>> GetPageAsync(NationalTeamMatchQuery query);
    Task<NationalTeamMatchFilterOptionsDto> GetFilterOptionsAsync();
    Task<NationalTeamMatchDto?> GetByIdAsync(int id);
    Task<NationalTeamMatchDto?> CreateAsync(CreateNationalTeamMatchDto dto, List<string> errors);
    Task<NationalTeamMatchDto?> UpdateAsync(int id, UpdateNationalTeamMatchDto dto, List<string> errors);
    Task<NationalTeamMatchDto?> LinkTeamsAsync(int id, LinkNationalTeamMatchTeamsDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
    Task<ExportFile?> ExportAsync(string format);
}
