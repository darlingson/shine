using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface INationalTeamMatchSquadRepository
{
    Task<IEnumerable<NationalTeamMatchSquad>> GetAllAsync();
    Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, string nationalTeam, int playerId);
    Task<NationalTeamMatchSquad> AddAsync(NationalTeamMatchSquad squad);
    void Update(NationalTeamMatchSquad squad);
    void Delete(NationalTeamMatchSquad squad);
    Task<bool> ExistsAsync(int matchId, string nationalTeam, int playerId);
    Task SaveChangesAsync();
}
