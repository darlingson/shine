using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IPlayerService
{
    Task<IEnumerable<Player>> GetAllAsync();
    Task<PagedResult<Player>> GetPageAsync(PlayerQuery query);
    Task<PlayerFilterOptionsDto> GetFilterOptionsAsync();
    Task<Player?> GetByIdAsync(int id);
    Task<Player> CreateAsync(CreatePlayerDto dto, List<string> errors);
    Task<Player?> UpdateAsync(int id, UpdatePlayerDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
    Task<ExportFile?> ExportAsync(string format);
}
