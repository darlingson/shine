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
}
