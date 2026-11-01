using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

public class ClubMatchDto
{
    public int MatchId { get; set; }
    public DateOnly MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }

    /// <summary>Linked competition identity, once identified.</summary>
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }

    /// <summary>Display name resolved from the linked competition (falls back to nothing when unlinked — the free-text Competition stays the provenance record).</summary>
    public string? CompetitionName { get; set; }

    /// <summary>Display name resolved from the linked season (its Name, else its Label).</summary>
    public string? SeasonName { get; set; }

    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public string? HomeClubName { get; set; }
    public string? AwayClubName { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Filters, sort and paging for the club-match browser. Matching is case-insensitive.</summary>
public class ClubMatchQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against both club names, competition, season and venue.</summary>
    public string? Q { get; set; }

    /// <summary>Matches where the club is either the home or the away side.</summary>
    public int? ClubId { get; set; }

    /// <summary>Exact competition match.</summary>
    public string? Competition { get; set; }

    /// <summary>Exact season match.</summary>
    public string? Season { get; set; }

    /// <summary>Matches linked to this competition.</summary>
    public int? CompetitionId { get; set; }

    /// <summary>Matches linked to this season.</summary>
    public int? SeasonId { get; set; }

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

public class ClubMatchFilterOptionsDto
{
    public List<string> Competitions { get; set; } = [];
    public List<string> Seasons { get; set; } = [];
}

public class CreateClubMatchDto
{
    [Required]
    public DateOnly? MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }

    /// <summary>Competition identity — optional, final identification may happen
    /// later via the link endpoint. A seasonId alone is not allowed.</summary>
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }

    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdateClubMatchDto
{
    [Required]
    public DateOnly? MatchDate { get; set; }
    public string? Competition { get; set; }
    public string? Season { get; set; }

    /// <summary>Competition identity — optional, final identification may happen
    /// later via the link endpoint. A seasonId alone is not allowed.</summary>
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }

    public int? HomeClubId { get; set; }
    public int? AwayClubId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Venue { get; set; }
    public string? SourceUrl { get; set; }
}

/// <summary>Sets or corrects the two clubs on an existing match.</summary>
public class LinkClubMatchTeamsDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int HomeClubId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int AwayClubId { get; set; }
}

/// <summary>Replaces the competition (and season) links on an existing match in
/// one pass: a competition without a season clears the season; a null
/// competition clears both. The free-text columns are not touched — they keep
/// what the source said at the time.</summary>
public class LinkClubMatchCompetitionDto
{
    public int? CompetitionId { get; set; }
    public int? SeasonId { get; set; }
}
