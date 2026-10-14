namespace ShineApi.Models;

public class ReviewFlag
{
    public int ReviewFlagId { get; set; }

    /// <summary>e.g. club-match-squad, player</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>Key of the flagged row, e.g. "match/1/club/1/player/6".</summary>
    public string EntityKey { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;
    public double? Score { get; set; }

    /// <summary>open / resolved</summary>
    public string Status { get; set; } = "open";

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
