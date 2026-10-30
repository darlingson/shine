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

    /// <summary>Full competition list as a CSV or JSON download.</summary>
    Task<ExportFile?> ExportAsync(string format);

    // Seasons — named editions, created and managed under their competition.
    Task<IEnumerable<CompetitionSeason>> GetSeasonsAsync(int competitionId);
    Task<CompetitionSeason?> GetSeasonAsync(int competitionId, int seasonId);
    Task<CompetitionSeason?> CreateSeasonAsync(int competitionId, CreateCompetitionSeasonDto dto, List<string> errors);
    Task<CompetitionSeason?> UpdateSeasonAsync(int competitionId, int seasonId, UpdateCompetitionSeasonDto dto, List<string> errors);
    Task<bool> DeleteSeasonAsync(int competitionId, int seasonId);

    /// <summary>Every edition of every competition as a CSV or JSON download,
    /// competition resolved beside each row.</summary>
    Task<ExportFile?> ExportSeasonsAsync(string format);
}
