using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class ClubMatchDto
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public string? HomeClubName { get; set; }
    public string? AwayClubName { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class CreateClubMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateClubMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Sets or corrects the two clubs on an existing match.</summary>
public class LinkClubMatchTeamsDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int HomeClubId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int AwayClubId { get; set; }
}
