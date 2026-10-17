using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class ClubMatchRepository : IClubMatchRepository
{
    private readonly ShineDbContext _context;

    public ClubMatchRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClubMatch>> GetAllAsync()
        => await _context.ClubMatch
            .Include(x => x.HomeClub)
            .Include(x => x.AwayClub)
            .AsNoTracking()
            .ToListAsync();

    public async Task<ClubMatch?> GetByIdAsync(int id)
        => await _context.ClubMatch
            .Include(x => x.HomeClub)
            .Include(x => x.AwayClub)
            .FirstOrDefaultAsync(x => x.MatchId == id);

    public async Task<ClubMatch> AddAsync(ClubMatch match)
    {
        await _context.ClubMatch.AddAsync(match);
        return match;
    }

    public void Update(ClubMatch match)
        => _context.ClubMatch.Update(match);

    public void Delete(ClubMatch match)
        => _context.ClubMatch.Remove(match);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
