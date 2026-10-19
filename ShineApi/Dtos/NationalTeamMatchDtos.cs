using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class NationalTeamMatchDto
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public string? HomeNationalTeamName { get; set; }
    public string? AwayNationalTeamName { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Filters, sort and paging for the national-team match browser. Matching is case-insensitive.</summary>
public class NationalTeamMatchQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against both team names, competition, season and venue.</summary>
    public string? Q { get; set; }

    /// <summary>Matches where the team is either the home or the away side.</summary>
    public int? NationalTeamId { get; set; }

    /// <summary>Exact competition match.</summary>
    public string? Competition { get; set; }

    /// <summary>Exact season match.</summary>
    public string? Season { get; set; }

    /// <summary>Earliest match date, inclusive.</summary>
    public DateOnly? DateFrom { get; set; }

    /// <summary>Latest match date, inclusive.</summary>
    public DateOnly? DateTo { get; set; }

    /// <summary>One of matchDate, competition, venue, createdAt. Unknown values fall back to matchDate.</summary>
    public string? Sort { get; set; }

    /// <summary>asc or desc. Defaults to desc for matchDate, asc otherwise.</summary>
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

public class NationalTeamMatchFilterOptionsDto
{
    public List<string> Competitions { get; set; } = [];
    public List<string> Seasons { get; set; } = [];
}

public class CreateNationalTeamMatchDto
{
    [Required]
    public DateOnly? MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateNationalTeamMatchDto
{
    [Required]
    public DateOnly? MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }
    public int? HomeNationalTeamId { get; set; }
    public int? AwayNationalTeamId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Sets or corrects the two national teams on an existing match.</summary>
public class LinkNationalTeamMatchTeamsDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int HomeNationalTeamId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int AwayNationalTeamId { get; set; }
}
