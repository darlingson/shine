namespace ShineApi.Models;

/// <summary>A dated staff role at exactly one team — "Mario Marinica was
/// head coach of the Flames from 2023 to 2025". The team is either a club or
/// a national team (never both, never neither — enforced in the service
/// layer); club fixtures and national fixtures are different stacks, but the
/// people are one registry, so the appointment carries the team choice.
/// EndDate left open means the role is ongoing. An occasional caretaker stint
/// is just a short window, not a new concept.</summary>
public class StaffAppointment
{
    public int StaffAppointmentId { get; set; }
    public int StaffMemberId { get; set; }

    /// <summary>Canonical role code — see <see cref="StaffRoles"/>.</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>Exactly one of these is set. NULL after their team is deleted,
    /// mirroring how match team links behave.</summary>
    public int? ClubId { get; set; }
    public int? NationalTeamId { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public StaffMember? StaffMember { get; set; }
    public Club? Club { get; set; }
    public NationalTeam? NationalTeam { get; set; }
}
