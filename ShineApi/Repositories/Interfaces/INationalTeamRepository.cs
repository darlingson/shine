using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface INationalTeamRepository
{
    Task<IEnumerable<NationalTeam>> GetAllAsync();
    Task<(IReadOnlyList<NationalTeam> Items, int Total)> GetPageAsync(NationalTeamQuery query);
    Task<(IReadOnlyList<string> Countries, IReadOnlyList<string> Genders, IReadOnlyList<string> Levels)> GetFilterOptionsAsync();
    Task<NationalTeam?> GetByIdAsync(int id);
    Task<NationalTeam> AddAsync(NationalTeam nationalTeam);
    void Update(NationalTeam nationalTeam);
    void Delete(NationalTeam nationalTeam);
    Task<bool> ExistsAsync(int id);
    Task<bool> NameExistsAsync(string name, int? excludeId = null);
    Task SaveChangesAsync();
}
