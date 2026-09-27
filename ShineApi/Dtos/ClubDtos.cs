using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreateClubDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? City { get; set; }
    public string Country { get; set; } = "Malawi";
    public int? FoundedYear { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateClubDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? City { get; set; }
    public string Country { get; set; } = "Malawi";
    public int? FoundedYear { get; set; }
    public string? SourceUrl { get; set; }
}
