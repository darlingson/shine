namespace ShineApi.Models;

/// <summary>A named edition of a competition — where time-varying display
/// names accrue instead of renaming the competition itself: "TNM Super League
/// 2025" and "FDH Premiership 2026" are both seasons of the "Super League"
/// competition. Label may stay empty for editions whose year is unknown (e.g.
/// an old FAM Cup edition) — Postgres treats NULLs as distinct in unique
/// indexes, so several label-less editions can coexist.</summary>
public class CompetitionSeason
{
    public int SeasonId { get; set; }
    public int CompetitionId { get; set; }

    /// <summary>Year designation as used by the competition, e.g. "2026",
    /// "2025/26". Null for editions whose year is unknown.</summary>
    public string? Label { get; set; }

    /// <summary>Display name of this edition, sponsor included, e.g.
    /// "FDH Premiership 2026". Falls back to Label when empty.</summary>
    public string? Name { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Competition? Competition { get; set; }
}
