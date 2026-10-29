using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface ICompetitionService
{
    Task<IEnumerable<Competition>> GetAllAsync();
    Task<PagedResult<Competition>> GetPageAsync(CompetitionQuery query);
    Task<CompetitionFilterOptionsDto> GetFilterOptionsAsync();
    Task<Competition?> GetByIdAsync(int id);
    Task<Competition?> CreateAsync(CreateCompetitionDto dto, List<string> errors);
    Task<Competition?> UpdateAsync(int id, UpdateCompetitionDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
}
