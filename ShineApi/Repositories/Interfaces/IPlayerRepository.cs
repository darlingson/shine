using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IPlayerRepository
{
    Task<IEnumerable<Player>> GetAllAsync();
    Task<(IReadOnlyList<Player> Items, int Total)> GetPageAsync(PlayerQuery query);
    Task<(IReadOnlyList<string> Nationalities, IReadOnlyList<string> Positions)> GetFilterOptionsAsync();
    Task<Player?> GetByIdAsync(int id);
    Task<Player> AddAsync(Player player);
    void Update(Player player);
    void Delete(Player player);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
