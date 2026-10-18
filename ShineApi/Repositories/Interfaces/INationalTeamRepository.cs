using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface INationalTeamRepository
{
    Task<IEnumerable<NationalTeam>> GetAllAsync();
    Task<NationalTeam?> GetByIdAsync(int id);
    Task<NationalTeam> AddAsync(NationalTeam nationalTeam);
    void Update(NationalTeam nationalTeam);
    void Delete(NationalTeam nationalTeam);
    Task<bool> ExistsAsync(int id);
    Task<bool> NameExistsAsync(string name, int? excludeId = null);
    Task SaveChangesAsync();
}
