using Microsoft.EntityFrameworkCore;

namespace ShineApi.Models;

public class ShineDbContext : DbContext
{
    public ShineDbContext(DbContextOptions<ShineDbContext> options)
        : base(options)
    {
    }

    public DbSet<Club> Club { get; set; } = null!;
    public DbSet<ClubMatchSquad> ClubMatchSquad { get; set; } = null!;
    public DbSet<Match> Match { get; set; } = null!;
    public DbSet<NationalTeamMatchSquad> NationalTeamMatchSquad { get; set; } = null!;
    public DbSet<Player> Player { get; set; } = null!;
    public DbSet<PlayerClub> PlayerClub { get; set; } = null!;
}