using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreatePlayerDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;
    public string? KnownAs { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string Nationality { get; set; } = "Malawi";
    public string? PositionPrimary { get; set; }
    public string? PositionSecondary { get; set; }
    public int? HeightCm { get; set; }
    public string? Foot { get; set; }
    public string Status { get; set; } = "active";
    public string? SourceUrl { get; set; }
}

public class UpdatePlayerDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;
    public string? KnownAs { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string Nationality { get; set; } = "Malawi";
    public string? PositionPrimary { get; set; }
    public string? PositionSecondary { get; set; }
    public int? HeightCm { get; set; }
    public string? Foot { get; set; }
    public string Status { get; set; } = "active";
    public string? SourceUrl { get; set; }
}
