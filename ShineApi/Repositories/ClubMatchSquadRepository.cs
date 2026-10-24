using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class ClubMatchSquadRepository : IClubMatchSquadRepository
{
    private readonly ShineDbContext _context;

    public ClubMatchSquadRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClubMatchSquad>> GetAllAsync()
        => await _context.ClubMatchSquad.AsNoTracking().ToListAsync();

    /// <summary>All squad entries with player, club and match (incl. both sides)
    /// resolved for export.</summary>
    public async Task<IEnumerable<ClubMatchSquad>> GetAllForExportAsync()
        => await _context.ClubMatchSquad
            .Include(x => x.Player)
            .Include(x => x.Club)
            .Include(x => x.Match).ThenInclude(m => m.HomeClub)
            .Include(x => x.Match).ThenInclude(m => m.AwayClub)
            .AsNoTracking()
            .ToListAsync();

    public async Task<ClubMatchSquad?> GetByIdAsync(int matchId, int clubId, int playerId)
        => await _context.ClubMatchSquad.FindAsync(matchId, clubId, playerId);

    public async Task<ClubMatchSquad> AddAsync(ClubMatchSquad squad)
    {
        await _context.ClubMatchSquad.AddAsync(squad);
        return squad;
    }

    public void Update(ClubMatchSquad squad)
        => _context.ClubMatchSquad.Update(squad);

    public void Delete(ClubMatchSquad squad)
        => _context.ClubMatchSquad.Remove(squad);

    public async Task<bool> ExistsAsync(int matchId, int clubId, int playerId)
        => await _context.ClubMatchSquad.AnyAsync(x =>
            x.MatchId == matchId && x.ClubId == clubId && x.PlayerId == playerId);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
