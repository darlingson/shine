using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

/// <summary>Query for the staff-member browser. Matching is case-insensitive.</summary>
public class StaffMemberQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against full name and known-as name.</summary>
    public string? Q { get; set; }

    /// <summary>Exact nationality match.</summary>
    public string? Nationality { get; set; }

    /// <summary>Only members with an appointment at this club — active roles
    /// and history alike.</summary>
    public int? ClubId { get; set; }

    /// <summary>Only members with an appointment at this national team.</summary>
    public int? NationalTeamId { get; set; }

    /// <summary>One of name, nationality, createdAt. Unknown values fall back to name.</summary>
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

public class StaffMemberFilterOptionsDto
{
    public List<string> Nationalities { get; set; } = [];
}

public class CreateStaffMemberDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string? KnownAs { get; set; }

    public string Nationality { get; set; } = "Malawi";

    /// <summary>Optional connect to the player registry (player-coaches).</summary>
    public int? PlayerId { get; set; }

    public string? SourceUrl { get; set; }
}

public class UpdateStaffMemberDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string? KnownAs { get; set; }

    public string Nationality { get; set; } = "Malawi";

    public int? PlayerId { get; set; }

    public string? SourceUrl { get; set; }
}
