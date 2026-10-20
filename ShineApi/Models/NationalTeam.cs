namespace ShineApi.Models;

public class NationalTeam
{
    public int NationalTeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }

    /// <summary>Informal name, e.g. "The Scorchers".</summary>
    public string? Nickname { get; set; }

    /// <summary>men / women / mixed</summary>
    public string? Gender { get; set; }

    /// <summary>senior / U23 / U20 / U17</summary>
    public string? Level { get; set; }

    /// <summary>Head coach as currently known, e.g. "Lovemore Fazili". Not date-ranged.</summary>
    public string? Coach { get; set; }

    public string Country { get; set; } = "Malawi";
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
