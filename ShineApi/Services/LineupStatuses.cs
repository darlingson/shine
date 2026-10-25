namespace ShineApi.Services;

/// <summary>Canonical lineup-status vocabulary shared by club and
/// national-team squad rows. Rejects unknown values — a squad row always says
/// how a player relates to the matchday squad: starter, substitute,
/// matchday_squad (listed without a confirmed starter/bench split),
/// unused_sub, reserve, suspended or injured.</summary>
public static class LineupStatuses
{
    public const string Starter = "starter";
    public const string Substitute = "substitute";
    public const string MatchdaySquad = "matchday_squad";
    public const string UnusedSub = "unused_sub";
    public const string Reserve = "reserve";
    public const string Suspended = "suspended";
    public const string Injured = "injured";

    public static readonly IReadOnlyList<string> StatusesList =
        [Starter, Substitute, MatchdaySquad, UnusedSub, Reserve, Suspended, Injured];

    /// <summary>Accepted spellings (case-insensitive, trimmed) to canonical
    /// values. Deliberately excludes "bench" — a bench listing alone never says
    /// whether a sub was used.</summary>
    private static readonly IReadOnlyDictionary<string, string> StatusByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["starter"] = Starter,
            ["starting xi"] = Starter,

            ["substitute"] = Substitute,
            ["sub"] = Substitute,
            ["used sub"] = Substitute,

            ["matchday_squad"] = MatchdaySquad,
            ["matchday squad"] = MatchdaySquad,
            ["squad"] = MatchdaySquad,

            ["unused_sub"] = UnusedSub,
            ["unused sub"] = UnusedSub,
            ["unused substitute"] = UnusedSub,

            ["reserve"] = Reserve,
            ["reserves"] = Reserve,
        };

    /// <summary>Normalizes one lineup status: empty and unknown values add a
    /// validation error naming the field and allowed values.</summary>
    public static string? NormalizeOrError(string? input, string field, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
        {
            errors.Add($"Missing lineup status for {field}. Allowed values: {AllowedList}.");
            return null;
        }

        if (StatusByAlias.TryGetValue(value, out var status))
            return status;

        errors.Add($"Unknown lineup status '{input}' for {field}. Allowed values: {AllowedList}.");
        return null;
    }

    /// <summary>Canonical lineup statuses joined as ", "-separated text, for
    /// validation error messages.</summary>
    public static string AllowedList
        => string.Join(", ", StatusesList);
}
