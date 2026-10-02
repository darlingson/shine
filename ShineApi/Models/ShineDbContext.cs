using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace ShineApi.Models;

public class ShineDbContext : IdentityDbContext
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClubMatchSquad>()
            .HasKey(x => new { x.MatchId, x.ClubId, x.PlayerId });

        modelBuilder.Entity<NationalTeamMatchSquad>()
            .HasKey(x => new { x.MatchId, x.NationalTeam, x.PlayerId });
    }
}