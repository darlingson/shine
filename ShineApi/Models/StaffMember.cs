namespace ShineApi.Models;

/// <summary>A staff person — coaches, managers, technical directors — in one
/// registry shared by clubs and national teams, exactly like players. Which
/// team they currently serve is a fact of <see cref="StaffAppointment"/> rows
/// (dated roles), never of this record: the registry stays stable while
/// roles and teams change.</summary>
public class StaffMember
{
    public int StaffMemberId { get; set; }

    public string FullName { get; set; } = string.Empty;

    /// <summary>What they are usually called, when it differs — the name used
    /// publicly ("Mario Marinica"), falling back to FullName.</summary>
    public string? KnownAs { get; set; }

    public string Nationality { get; set; } = "Malawi";

    /// <summary>Optional connect to the player registry for people who held
    /// both roles (player-coaches, a retired keeper who became a GK coach).
    /// NULL for everyone else — never required.</summary>
    public int? PlayerId { get; set; }

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Player? Player { get; set; }

    /// <summary>Dated roles held over time; see <see cref="StaffAppointment"/>.</summary>
    public ICollection<StaffAppointment>? Appointments { get; set; }
}
