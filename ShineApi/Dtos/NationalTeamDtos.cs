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
    public string Country { get; set; } = "Malawi";
    public string? SourceUrl { get; set; }
}

/// <summary>Filters, sort and paging for the national team browser. Matching is case-insensitive.</summary>
public class NationalTeamQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against name, short name, nickname and coach.</summary>
    public string? Q { get; set; }

    /// <summary>Exact country match.</summary>
    public string? Country { get; set; }

    /// <summary>Exact gender match — men, women or mixed.</summary>
    public string? Gender { get; set; }

    /// <summary>Exact level match — senior, U23, U20 or U17.</summary>
    public string? Level { get; set; }

    /// <summary>One of name, country, level, gender, createdAt. Unknown values fall back to name.</summary>
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

public class NationalTeamFilterOptionsDto
{
    public List<string> Countries { get; set; } = [];
    public List<string> Genders { get; set; } = [];
    public List<string> Levels { get; set; } = [];
}
