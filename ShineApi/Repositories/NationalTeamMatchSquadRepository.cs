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

    public async Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, string nationalTeam, int playerId)
        => await _context.NationalTeamMatchSquad.FindAsync(matchId, nationalTeam, playerId);

    public async Task<NationalTeamMatchSquad> AddAsync(NationalTeamMatchSquad squad)
    {
        await _context.NationalTeamMatchSquad.AddAsync(squad);
        return squad;
    }

    public void Update(NationalTeamMatchSquad squad)
        => _context.NationalTeamMatchSquad.Update(squad);

    public void Delete(NationalTeamMatchSquad squad)
        => _context.NationalTeamMatchSquad.Remove(squad);

    public async Task<bool> ExistsAsync(int matchId, string nationalTeam, int playerId)
        => await _context.NationalTeamMatchSquad.AnyAsync(x =>
            x.MatchId == matchId && x.NationalTeam == nationalTeam && x.PlayerId == playerId);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
