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

    /// <summary>Competition identity on the recorded match — optional; a
    /// seasonId without its competitionId is rejected.</summary>
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int HomeClubId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int AwayClubId { get; set; }

    [Range(0, 99)]
    public int? HomeScore { get; set; }

    [Range(0, 99)]
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class MatchRecordSquadRowDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int ClubId { get; set; }

    /// <summary>Player display name as on the team sheet. Always a name — never an id.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional resolution hints from the contributor.</summary>
    public string? Position { get; set; }

    [Range(1, 99)]
    public int? ShirtNumber { get; set; }

    [Required]
    public string LineupStatus { get; set; } = string.Empty;

    [Range(0, 150)]
    public int? MinutesPlayed { get; set; }

    [Range(0, 30)]
    public int Goals { get; set; } = 0;

    [Range(0, 30)]
    public int Assists { get; set; } = 0;

    [Range(0, 10)]
    public int YellowCards { get; set; } = 0;

    [Range(0, 5)]
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
    public List<ReviewFlagDto> ReviewFlags { get; set; } = [];
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

public class ReviewFlagDto
{
    public int ReviewFlagId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityKey { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public double? Score { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? SourceUrl { get; set; }

    public static ReviewFlagDto From(Models.ReviewFlag f) => new()
    {
        ReviewFlagId = f.ReviewFlagId,
        EntityType = f.EntityType,
        EntityKey = f.EntityKey,
        Reason = f.Reason,
        Score = f.Score,
        Status = f.Status,
        SourceUrl = f.SourceUrl,
    };
}

public class ResolveFlagDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
