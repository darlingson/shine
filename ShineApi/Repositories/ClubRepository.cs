using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class ClubRepository : IClubRepository
{
    private readonly ShineDbContext _context;

    public ClubRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Club>> GetAllAsync()
        => await _context.Club.AsNoTracking().ToListAsync();

    public async Task<Club?> GetByIdAsync(int id)
        => await _context.Club.FindAsync(id);

    public async Task<Club> AddAsync(Club club)
    {
        await _context.Club.AddAsync(club);
        return club;
    }

    public void Update(Club club)
        => _context.Club.Update(club);

    public void Delete(Club club)
        => _context.Club.Remove(club);

    public async Task<bool> ExistsAsync(int id)
        => await _context.Club.AnyAsync(x => x.ClubId == id);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
