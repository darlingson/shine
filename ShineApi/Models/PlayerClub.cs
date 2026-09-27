namespace ShineApi.Models;

public class PlayerClub
{
    public int PlayerClubId { get; set; }
    public int PlayerId { get; set; }
    public int ClubId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;

    /// <summary>permanent / loan / youth / trial</summary>
    public string? ContractType { get; set; }

    public int? ShirtNumber { get; set; }
    public string? PositionAtClub { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Player? Player { get; set; }
    public Club? Club { get; set; }
}
