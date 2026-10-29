using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class CreateCompetitionDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }

    /// <summary>league / cup</summary>
    [Required]
    public string Kind { get; set; } = string.Empty;

    /// <summary>Pyramid position — leagues only (1 = top flight).</summary>
    public int? Tier { get; set; }

    /// <summary>national / regional / continental / international</summary>
    public string? Scope { get; set; }

    /// <summary>Geography within regional scope, e.g. south / centre / north.</summary>
    public string? Region { get; set; }

    public string? SourceUrl { get; set; }
}

public class UpdateCompetitionDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }

    /// <summary>league / cup</summary>
    [Required]
    public string Kind { get; set; } = string.Empty;

    /// <summary>Pyramid position — leagues only (1 = top flight).</summary>
    public int? Tier { get; set; }

    /// <summary>national / regional / continental / international</summary>
    public string? Scope { get; set; }

    /// <summary>Geography within regional scope, e.g. south / centre / north.</summary>
    public string? Region { get; set; }

    public string? SourceUrl { get; set; }
}

/// <summary>Filters, sort and paging for the competition browser. Matching is case-insensitive.</summary>
public class CompetitionQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against name and short name.</summary>
    public string? Q { get; set; }

    /// <summary>Exact kind match — league or cup.</summary>
    public string? Kind { get; set; }

    /// <summary>Exact tier match — leagues only.</summary>
    public int? Tier { get; set; }

    /// <summary>Exact scope match — national, regional, continental or international.</summary>
    public string? Scope { get; set; }

    /// <summary>Exact region match.</summary>
    public string? Region { get; set; }

    /// <summary>One of name, kind, tier, scope, createdAt. Unknown values fall back to name.</summary>
    public string? Sort { get; set; }

    /// <summary>asc or desc. Anything else is treated as asc.</summary>
    public string? Order { get; set; }

    public int Page
    {
        get => _page;
        set => _page = Math.Max(1, value);
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }
}

public class CompetitionFilterOptionsDto
{
    public List<string> Kinds { get; set; } = [];
    public List<int> Tiers { get; set; } = [];
    public List<string> Scopes { get; set; } = [];
    public List<string> Regions { get; set; } = [];
}

public class CreateCompetitionSeasonDto
{
    /// <summary>Year designation as used by the competition, e.g. "2026",
    /// "2025/26". May stay empty for editions whose year is unknown — but a
    /// season needs a label or a name.</summary>
    public string? Label { get; set; }

    /// <summary>Display name of this edition, sponsor included, e.g.
    /// "FDH Premiership 2026". Falls back to Label when empty.</summary>
    public string? Name { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateCompetitionSeasonDto
{
    /// <summary>Year designation as used by the competition, e.g. "2026",
    /// "2025/26". May stay empty for editions whose year is unknown — but a
    /// season needs a label or a name.</summary>
    public string? Label { get; set; }

    /// <summary>Display name of this edition, sponsor included, e.g.
    /// "FDH Premiership 2026". Falls back to Label when empty.</summary>
    public string? Name { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? SourceUrl { get; set; }
}
