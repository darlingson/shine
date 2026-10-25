using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class PlayerClubRepository : IPlayerClubRepository
{
    private readonly ShineDbContext _context;

    public PlayerClubRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlayerClub>> GetAllAsync()
        => await _context.PlayerClub.AsNoTracking().ToListAsync();

    /// <summary>All stints with related player and club resolved for export.</summary>
    public async Task<IEnumerable<PlayerClub>> GetAllForExportAsync()
        => await _context.PlayerClub
            .Include(pc => pc.Player)
            .Include(pc => pc.Club)
            .AsNoTracking()
            .ToListAsync();

    public async Task<PlayerClub?> GetByIdAsync(int id)
        => await _context.PlayerClub.FindAsync(id);

    public async Task<PlayerClub> AddAsync(PlayerClub playerClub)
    {
        await _context.PlayerClub.AddAsync(playerClub);
        return playerClub;
    }

    public void Update(PlayerClub playerClub)
        => _context.PlayerClub.Update(playerClub);

    public void Delete(PlayerClub playerClub)
        => _context.PlayerClub.Remove(playerClub);

    public async Task<bool> ExistsAsync(int id)
        => await _context.PlayerClub.AnyAsync(x => x.PlayerClubId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
