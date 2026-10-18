using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class NationalTeamMatchRepository : INationalTeamMatchRepository
{
    private readonly ShineDbContext _context;

    public NationalTeamMatchRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NationalTeamMatch>> GetAllAsync()
        => await _context.NationalTeamMatch
            .Include(x => x.HomeNationalTeam)
            .Include(x => x.AwayNationalTeam)
            .AsNoTracking()
            .ToListAsync();

    public async Task<NationalTeamMatch?> GetByIdAsync(int id)
        => await _context.NationalTeamMatch
            .Include(x => x.HomeNationalTeam)
            .Include(x => x.AwayNationalTeam)
            .FirstOrDefaultAsync(x => x.MatchId == id);

    public async Task<NationalTeamMatch> AddAsync(NationalTeamMatch match)
    {
        await _context.NationalTeamMatch.AddAsync(match);
        return match;
    }

    public void Update(NationalTeamMatch match)
        => _context.NationalTeamMatch.Update(match);

    public void Delete(NationalTeamMatch match)
        => _context.NationalTeamMatch.Remove(match);

    public async Task<bool> ExistsAsync(int id)
        => await _context.NationalTeamMatch.AnyAsync(x => x.MatchId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
