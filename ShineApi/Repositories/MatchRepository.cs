using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly ShineDbContext _context;

    public MatchRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Match>> GetAllAsync()
        => await _context.Match.AsNoTracking().ToListAsync();

    public async Task<Match?> GetByIdAsync(int id)
        => await _context.Match.FindAsync(id);

    public async Task<Match> AddAsync(Match match)
    {
        await _context.Match.AddAsync(match);
        return match;
    }

    public void Update(Match match)
        => _context.Match.Update(match);

    public void Delete(Match match)
        => _context.Match.Remove(match);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Match.AnyAsync(x => x.MatchId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
