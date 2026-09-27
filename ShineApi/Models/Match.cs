namespace ShineApi.Models;

public class Match
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }

    /// <summary>e.g. Super League, AFCON qualifier</summary>
    public string? Competition { get; set; }

    /// <summary>e.g. 2025/26</summary>
    public string? Season { get; set; }

    public string? HomeTeam { get; set; }
    public string? AwayTeam { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
