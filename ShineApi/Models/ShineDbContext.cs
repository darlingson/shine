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
    public DbSet<RefreshToken> RefreshToken { get; set; } = null!;
    public DbSet<UserPermission> UserPermission { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClubMatchSquad>()
            .HasKey(x => new { x.MatchId, x.ClubId, x.PlayerId });

        modelBuilder.Entity<NationalTeamMatchSquad>()
            .HasKey(x => new { x.MatchId, x.NationalTeam, x.PlayerId });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => x.UserId);
            entity.Property(x => x.UserId).HasMaxLength(450).IsRequired();
            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(x => x.ReplacedByTokenHash).HasMaxLength(128);
        });

        modelBuilder.Entity<UserPermission>(entity =>
        {
            entity.HasKey(x => new { x.UserId, x.Permission });
            entity.Property(x => x.UserId).HasMaxLength(450).IsRequired();
            entity.Property(x => x.Permission).HasMaxLength(100).IsRequired();
        });
    }
}