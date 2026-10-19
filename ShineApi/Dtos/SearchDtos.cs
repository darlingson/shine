namespace ShineApi.Dtos;

/// <summary>Searchable entity kinds and the parseable <c>kinds</c> query values.</summary>
public static class SearchKinds
{
    public const string Player = "player";
    public const string Club = "club";
    public const string NationalTeam = "nationalTeam";
    public const string ClubMatch = "clubMatch";
    public const string NationalTeamMatch = "nationalTeamMatch";

    public static readonly string[] All = [Player, Club, NationalTeam, ClubMatch, NationalTeamMatch];

    public static bool IsKnown(string kind) => Array.IndexOf(All, kind) >= 0;
}

public class SearchResultDto
{
    public string Kind { get; set; } = string.Empty;
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Badge { get; set; }
}

public class SearchResponseDto
{
    public string Query { get; set; } = string.Empty;
    public List<SearchResultDto> Results { get; set; } = [];
}