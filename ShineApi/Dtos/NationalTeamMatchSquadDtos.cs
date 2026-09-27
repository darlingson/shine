using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreateNationalTeamMatchSquadDto
{
    public int MatchId { get; set; }

    [Required]
    public string NationalTeam { get; set; } = string.Empty;
    public int PlayerId { get; set; }

    [Required]
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
}

public class UpdateNationalTeamMatchSquadDto
{
    [Required]
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
}
