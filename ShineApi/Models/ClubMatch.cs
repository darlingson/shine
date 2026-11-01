namespace ShineApi.Models;

/// <summary>A match between two clubs. Team links are nullable so an incomplete
/// record can be created and linked later.</summary>
public class ClubMatch
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }

    /// <summary>e.g. Super League, FDH Bank Cup</summary>
    public string? Competition { get; set; }

    /// <summary>e.g. 2025/26</summary>
    public string? Season { get; set; }

    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>The competition this match belongs to, once identified. SetNull
    /// so deleting a competition only detaches it — the free-text columns keep
    /// what the source said at the time.</summary>
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }

    // Navigation properties
    public Club? HomeClub { get; set; }
    public Club? AwayClub { get; set; }
    public Competition? CompetitionRef { get; set; }
    public CompetitionSeason? SeasonRef { get; set; }
}
