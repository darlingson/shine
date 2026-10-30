using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface ICompetitionRepository
{
    Task<IEnumerable<Competition>> GetAllAsync();
    Task<(IReadOnlyList<Competition> Items, int Total)> GetPageAsync(CompetitionQuery query);
    Task<(IReadOnlyList<string> Kinds, IReadOnlyList<int> Tiers, IReadOnlyList<string> Scopes, IReadOnlyList<string> Regions)> GetFilterOptionsAsync();
    Task<Competition?> GetByIdAsync(int id);
    Task<Competition> AddAsync(Competition competition);
    void Update(Competition competition);
    void Delete(Competition competition);
    Task<bool> ExistsAsync(int id);
    Task<bool> NameExistsAsync(string name, int? excludeId = null);
    Task SaveChangesAsync();

    // Seasons — children of a competition ("FDH Premiership 2026" of "Super League").
    Task<IEnumerable<CompetitionSeason>> GetSeasonsAsync(int competitionId);
    Task<CompetitionSeason?> GetSeasonAsync(int competitionId, int seasonId);

    /// <summary>Season lookup without a competition context — used when
    /// validating match links ("does this season exist, and whose is it?").</summary>
    Task<CompetitionSeason?> GetSeasonByIdAsync(int seasonId);

    /// <summary>Every edition of every competition, with the competition
    /// resolved — read-only full list for the seasons export.</summary>
    Task<IEnumerable<CompetitionSeason>> GetAllSeasonsAsync();
    Task<CompetitionSeason> AddSeasonAsync(CompetitionSeason season);
    void UpdateSeason(CompetitionSeason season);
    void DeleteSeason(CompetitionSeason season);
    Task<bool> SeasonLabelInUseAsync(int competitionId, string label, int? excludeSeasonId = null);
}
