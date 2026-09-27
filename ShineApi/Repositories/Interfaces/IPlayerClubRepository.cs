using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IPlayerClubRepository
{
    Task<IEnumerable<PlayerClub>> GetAllAsync();
    Task<PlayerClub?> GetByIdAsync(int id);
    Task<PlayerClub> AddAsync(PlayerClub playerClub);
    void Update(PlayerClub playerClub);
    void Delete(PlayerClub playerClub);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
