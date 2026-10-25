using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IPlayerClubService
{
    Task<IEnumerable<PlayerClub>> GetAllAsync();
    Task<PlayerClub?> GetByIdAsync(int id);
    Task<PlayerClub?> CreateAsync(CreatePlayerClubDto dto, List<string> errors);
    Task<PlayerClub?> UpdateAsync(int id, UpdatePlayerClubDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
    Task<ExportFile?> ExportAsync(string format);
}
