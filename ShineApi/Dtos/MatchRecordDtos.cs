using System.ComponentModel.DataAnnotations;
using ShineApi.Models;

namespace ShineApi.Dtos;

public class CreateMatchRecordDto
{
    [Required]
    public MatchRecordMatchDto Match { get; set; } = new();

    [Required]
    [MinLength(1)]
    public List<MatchRecordSquadRowDto> Squads { get; set; } = [];
}

public class MatchRecordMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }

    public string? Competition { get; set; }
    public string? Season { get; set; }

    [Required]
    public int HomeClubId { get; set; }

    [Required]
    public int AwayClubId { get; set; }

    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class MatchRecordSquadRowDto
{
    [Required]
    public int ClubId { get; set; }

    /// <summary>Player display name as on the team sheet. Always a name — never an id.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional resolution hints from the contributor.</summary>
    public string? Position { get; set; }
    public int? ShirtNumber { get; set; }

    [Required]
    public string LineupStatus { get; set; } = string.Empty;

    public int? MinutesPlayed { get; set; }
    public int Goals { get; set; } = 0;
    public int Assists { get; set; } = 0;
    public int YellowCards { get; set; } = 0;
    public int RedCards { get; set; } = 0;
    public bool Captain { get; set; } = false;
    public string? SourceUrl { get; set; }
    public string? Notes { get; set; }
}

public class MatchRecordResultDto
{
    public int MatchId { get; set; }
    public List<MatchRecordEntryDto> Entries { get; set; } = [];
    public List<int> CreatedPlayerIds { get; set; } = [];
    public List<ReviewFlag> ReviewFlags { get; set; } = [];
}

public class MatchRecordEntryDto
{
    public int Row { get; set; }
    public int PlayerId { get; set; }

    /// <summary>linked / linked-unverified / created</summary>
    public string Decision { get; set; } = string.Empty;
    public double Score { get; set; }
    public string? Flag { get; set; }
}
