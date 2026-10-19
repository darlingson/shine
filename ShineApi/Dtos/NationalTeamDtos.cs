using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreateNationalTeamDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Nickname { get; set; }

    /// <summary>men / women / mixed</summary>
    public string? Gender { get; set; }

    /// <summary>senior / U23 / U20 / U17</summary>
    public string? Level { get; set; }

    public string? Coach { get; set; }
    public string Country { get; set; } = "Malawi";
    public string? SourceUrl { get; set; }
}

public class UpdateNationalTeamDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Nickname { get; set; }
    public string? Gender { get; set; }
    public string? Level { get; set; }
    public string? Coach { get; set; }
    public string Country { get; set; } = "Malawi";
    public string? SourceUrl { get; set; }
}
