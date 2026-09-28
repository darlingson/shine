using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly ShineDbContext _context;

    public PlayerRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Player>> GetAllAsync()
        => await _context.Player.AsNoTracking().ToListAsync();

    public async Task<Player?> GetByIdAsync(int id)
        => await _context.Player.FindAsync(id);

    public async Task<Player> AddAsync(Player player)
    {
        await _context.Player.AddAsync(player);
        return player;
    }

    public void Update(Player player)
        => _context.Player.Update(player);

    public void Delete(Player player)
        => _context.Player.Remove(player);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Player.AnyAsync(x => x.PlayerId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
