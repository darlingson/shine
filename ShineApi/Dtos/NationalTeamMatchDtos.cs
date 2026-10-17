using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class NationalTeamMatchDto
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public string? HomeNationalTeamName { get; set; }
    public string? AwayNationalTeamName { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class CreateNationalTeamMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateNationalTeamMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Sets or corrects the two national teams on an existing match.</summary>
public class LinkNationalTeamMatchTeamsDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int HomeNationalTeamId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int AwayNationalTeamId { get; set; }
}
