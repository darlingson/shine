using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface INationalTeamMatchRepository
{
    Task<IEnumerable<NationalTeamMatch>> GetAllAsync();
    Task<NationalTeamMatch?> GetByIdAsync(int id);
    Task<NationalTeamMatch> AddAsync(NationalTeamMatch match);
    void Update(NationalTeamMatch match);
    void Delete(NationalTeamMatch match);
    Task SaveChangesAsync();
}
