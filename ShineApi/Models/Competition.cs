namespace ShineApi.Models;

/// <summary>A football competition a match can belong to (a league or a cup).
/// The identity is stable and never renames: sponsor-driven name changes accrue
/// on its seasons instead — "Super League" carries the "TNM Super League" and
/// "FDH Premiership" eras (see <see cref="CompetitionSeason"/>).</summary>
public class Competition
{
    public int CompetitionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }

    /// <summary>league / cup</summary>
    public string Kind { get; set; } = string.Empty;

    /// <summary>Pyramid position for leagues: 1 = top flight, 2 = second tier,
    /// …. Cups stay null — they are not pyramid slots.</summary>
    public int? Tier { get; set; }

    /// <summary>national / regional / continental / international</summary>
    public string? Scope { get; set; }

    /// <summary>Geography within regional scope, e.g. Malawi's south / centre /
    /// north legs, or "cosafa" for a southern-African tournament.</summary>
    public string? Region { get; set; }

    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
