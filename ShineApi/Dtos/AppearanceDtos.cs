namespace ShineApi.Dtos;

/// <summary>One flat, denormalized squad appearance row across club and national
/// matches, for the combined appearances export. Fields a scope doesn't track are
/// null (e.g. stage on club matches).</summary>
public class MatchAppearanceDto
{
    /// <summary>club or national.</summary>
    public string MatchScope { get; set; } = string.Empty;

    public int MatchId { get; set; }
    public DateOnly? MatchDate { get; set; }

    /// <summary>Local kickoff time (CAT). Only set for national matches.</summary>
    public TimeOnly? KickoffTime { get; set; }

    public string? Competition { get; set; }
    public string? Season { get; set; }
    public string? Stage { get; set; }

    /// <summary>Side the player represents in this entry.</summary>
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }

    public int? OpponentId { get; set; }
    public string? OpponentName { get; set; }

    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }

    public bool? IsNeutral { get; set; }
    public bool? WentToExtraTime { get; set; }

    public int? PlayerId { get; set; }
    public string? PlayerName { get; set; }

    public string? LineupStatus { get; set; }
    public int? ShirtNumber { get; set; }
    public string? Position { get; set; }
    public int? MinutesPlayed { get; set; }
    public int Goals { get; set; } = 0;
    public int Assists { get; set; } = 0;
    public int YellowCards { get; set; } = 0;
    public int RedCards { get; set; } = 0;
    public bool Captain { get; set; } = false;
    public string? Notes { get; set; }
    public string? SourceUrl { get; set; }
}
