using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IClubMatchSquadService
{
    Task<IEnumerable<ClubMatchSquad>> GetAllAsync();
    Task<ClubMatchSquad?> GetByIdAsync(int matchId, int clubId, int playerId);
    Task<ClubMatchSquad?> CreateAsync(CreateClubMatchSquadDto dto);
    Task<ClubMatchSquad?> UpdateAsync(int matchId, int clubId, int playerId, UpdateClubMatchSquadDto dto);
    Task<bool> DeleteAsync(int matchId, int clubId, int playerId);
}
