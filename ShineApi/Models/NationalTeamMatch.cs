namespace ShineApi.Models;

/// <summary>A match between two national teams. Team links are nullable so an
/// incomplete record can be created and linked later.</summary>
public class NationalTeamMatch
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }

    /// <summary>Local kickoff time (CAT) on MatchDate. Null on date-only records.</summary>
    public TimeOnly? KickoffTime { get; set; }

    /// <summary>e.g. AFCON qualifier, COSAFA Cup</summary>
    public string? Competition { get; set; }

    /// <summary>e.g. 2025</summary>
    public string? Season { get; set; }

    /// <summary>Round or phase, e.g. "Group C", "Quarter-final", "Final".</summary>
    public string? Stage { get; set; }

    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }

    /// <summary>True when neither side is at home, e.g. a tournament at a neutral venue.</summary>
    public bool IsNeutral { get; set; }

    /// <summary>True when the match went to extra time.</summary>
    public bool WentToExtraTime { get; set; }

    /// <summary>Penalty shootout score. Both are null when there was no shootout.</summary>
    public int? HomePenaltyScore { get; set; }
    public int? AwayPenaltyScore { get; set; }

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public NationalTeam? HomeNationalTeam { get; set; }
    public NationalTeam? AwayNationalTeam { get; set; }
}
