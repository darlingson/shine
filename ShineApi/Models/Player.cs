namespace ShineApi.Models;

public class Player
{
    public int PlayerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? KnownAs { get; set; }

    /// <summary>ISO 8601 date: YYYY-MM-DD</summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>M / F / other / unknown</summary>
    public string? Gender { get; set; }

    public string Nationality { get; set; } = "Malawi";
    public string? PositionPrimary { get; set; }
    public string? PositionSecondary { get; set; }
    public int? HeightCm { get; set; }

    /// <summary>left / right / both</summary>
    public string? Foot { get; set; }

    /// <summary>active / retired / unknown</summary>
    public string Status { get; set; } = "active";

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
