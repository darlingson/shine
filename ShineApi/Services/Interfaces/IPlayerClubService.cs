using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IPlayerClubService
{
    Task<IEnumerable<PlayerClub>> GetAllAsync();
    Task<PlayerClub?> GetByIdAsync(int id);
    Task<PlayerClub> CreateAsync(CreatePlayerClubDto dto);
    Task<PlayerClub?> UpdateAsync(int id, UpdatePlayerClubDto dto);
    Task<bool> DeleteAsync(int id);
}
