using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;

namespace ShineApi.Repositories;

public class NationalTeamRepository : INationalTeamRepository
{
    private readonly ShineDbContext _context;

    public NationalTeamRepository(ShineDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NationalTeam>> GetAllAsync()
        => await _context.NationalTeam.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

    public async Task<NationalTeam?> GetByIdAsync(int id)
        => await _context.NationalTeam.FindAsync(id);

    public async Task<NationalTeam> AddAsync(NationalTeam nationalTeam)
    {
        await _context.NationalTeam.AddAsync(nationalTeam);
        return nationalTeam;
    }

    public void Update(NationalTeam nationalTeam)
        => _context.NationalTeam.Update(nationalTeam);

    public void Delete(NationalTeam nationalTeam)
        => _context.NationalTeam.Remove(nationalTeam);

    public async Task<bool> ExistsAsync(int id)
        => await _context.NationalTeam.AnyAsync(x => x.NationalTeamId == id);

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var normalized = name.Trim().ToLower();
        return await _context.NationalTeam.AnyAsync(x =>
            x.Name.ToLower() == normalized &&
            (excludeId == null || x.NationalTeamId != excludeId));
    }

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
