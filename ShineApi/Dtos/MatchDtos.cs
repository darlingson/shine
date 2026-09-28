using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreateMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public string? HomeTeam { get; set; }
    public string? AwayTeam { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateMatchDto
{
    [Required]
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public string? HomeTeam { get; set; }
    public string? AwayTeam { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}
