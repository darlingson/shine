using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class NationalTeamMatchSquadRepository : INationalTeamMatchSquadRepository
{
    private readonly ShineDbContext _context;

    public NationalTeamMatchSquadRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NationalTeamMatchSquad>> GetAllAsync()
        => await _context.NationalTeamMatchSquad.AsNoTracking().ToListAsync();

    /// <summary>All squad entries with player, team and match (incl. both sides)
    /// resolved for export.</summary>
    public async Task<IEnumerable<NationalTeamMatchSquad>> GetAllForExportAsync()
        => await _context.NationalTeamMatchSquad
            .Include(x => x.Player)
            .Include(x => x.NationalTeam)
            .Include(x => x.Match).ThenInclude(m => m!.HomeNationalTeam)
            .Include(x => x.Match).ThenInclude(m => m!.AwayNationalTeam)
            .AsNoTracking()
            .ToListAsync();

    public async Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, int nationalTeamId, int playerId)
        => await _context.NationalTeamMatchSquad.FindAsync(matchId, nationalTeamId, playerId);

    public async Task<NationalTeamMatchSquad> AddAsync(NationalTeamMatchSquad squad)
    {
        await _context.NationalTeamMatchSquad.AddAsync(squad);
        return squad;
    }

    public void Update(NationalTeamMatchSquad squad)
        => _context.NationalTeamMatchSquad.Update(squad);

    public void Delete(NationalTeamMatchSquad squad)
        => _context.NationalTeamMatchSquad.Remove(squad);

    public async Task<bool> ExistsAsync(int matchId, int nationalTeamId, int playerId)
        => await _context.NationalTeamMatchSquad.AnyAsync(x =>
            x.MatchId == matchId && x.NationalTeamId == nationalTeamId && x.PlayerId == playerId);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
