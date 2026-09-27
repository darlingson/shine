using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync();
    Task<Match?> GetByIdAsync(int id);
    Task<Match> AddAsync(Match match);
    void Update(Match match);
    void Delete(Match match);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
