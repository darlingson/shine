namespace ShineApi.Models;

public class ClubMatchSquad
{
    public int MatchId { get; set; }
    public int ClubId { get; set; }
    public int PlayerId { get; set; }

    /// <summary>starter / substitute / unused_sub / reserve / suspended / injured</summary>
    public string LineupStatus { get; set; } = string.Empty;

    public int? ShirtNumber { get; set; }
    public string? Position { get; set; }
    public int? MinutesPlayed { get; set; }
    public int Goals { get; set; } = 0;
    public int Assists { get; set; } = 0;
    public int YellowCards { get; set; } = 0;
    public int RedCards { get; set; } = 0;
    public bool Captain { get; set; } = false;
    public string? SourceUrl { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Match? Match { get; set; }
    public Club? Club { get; set; }
    public Player? Player { get; set; }
}
