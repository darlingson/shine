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

/// <summary>Filters, sort and paging for the player browser. Matching is case-insensitive.</summary>
public class PlayerQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against full name and known-as name.</summary>
    public string? Q { get; set; }

    /// <summary>Exact status match — active, retired or unknown.</summary>
    public string? Status { get; set; }

    /// <summary>Exact preferred-foot match — left, right or both.</summary>
    public string? Foot { get; set; }

    /// <summary>Exact nationality match.</summary>
    public string? Nationality { get; set; }

    /// <summary>Exact match against either the primary or secondary position.</summary>
    public string? Position { get; set; }

    /// <summary>Earliest year of birth, inclusive.</summary>
    public int? BornFrom { get; set; }

    /// <summary>Latest year of birth, inclusive.</summary>
    public int? BornTo { get; set; }

    /// <summary>One of name, knownAs, dateOfBirth, heightCm, status, createdAt. Unknown values fall back to name.</summary>
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

public class PlayerFilterOptionsDto
{
    public List<string> Nationalities { get; set; } = [];

    /// <summary>Distinct primary and secondary positions, combined.</summary>
    public List<string> Positions { get; set; } = [];
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
