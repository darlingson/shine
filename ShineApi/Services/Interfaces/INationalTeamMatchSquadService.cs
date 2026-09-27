using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface INationalTeamMatchSquadService
{
    Task<IEnumerable<NationalTeamMatchSquad>> GetAllAsync();
    Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, string nationalTeam, int playerId);
    Task<NationalTeamMatchSquad?> CreateAsync(CreateNationalTeamMatchSquadDto dto);
    Task<NationalTeamMatchSquad?> UpdateAsync(int matchId, string nationalTeam, int playerId, UpdateNationalTeamMatchSquadDto dto);
    Task<bool> DeleteAsync(int matchId, string nationalTeam, int playerId);
}
