using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IClubMatchSquadRepository
{
    Task<IEnumerable<ClubMatchSquad>> GetAllAsync();
    Task<ClubMatchSquad?> GetByIdAsync(int matchId, int clubId, int playerId);
    Task<ClubMatchSquad> AddAsync(ClubMatchSquad squad);
    void Update(ClubMatchSquad squad);
    void Delete(ClubMatchSquad squad);
    Task<bool> ExistsAsync(int matchId, int clubId, int playerId);
    Task SaveChangesAsync();
}
