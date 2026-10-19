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

/// <summary>Filters, sort and paging for the club browser. Matching is case-insensitive.</summary>
public class ClubQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against name, short name and city.</summary>
    public string? Q { get; set; }

    /// <summary>Exact city match.</summary>
    public string? City { get; set; }

    /// <summary>Exact country match.</summary>
    public string? Country { get; set; }

    public int? FoundedFrom { get; set; }
    public int? FoundedTo { get; set; }

    /// <summary>One of name, city, country, foundedYear, createdAt. Unknown values fall back to name.</summary>
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

public class ClubFilterOptionsDto
{
    public List<string> Cities { get; set; } = [];
    public List<string> Countries { get; set; } = [];
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
