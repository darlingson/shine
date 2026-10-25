namespace ShineApi.Services;

/// <summary>Canonical preferred-foot vocabulary: <c>left</c>, <c>right</c> or
/// <c>both</c>. Empty is allowed — it means unknown.</summary>
public static class Feet
{
    public const string Left = "left";
    public const string Right = "right";
    public const string Both = "both";

    public static readonly IReadOnlyList<string> FeetList = [Left, Right, Both];

    /// <summary>Accepted spellings (case-insensitive, trimmed) to canonical
    /// values — covers the free-text shorthands seen in the source data.</summary>
    private static readonly IReadOnlyDictionary<string, string> FootByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["left"] = Left,
            ["l"] = Left,
            ["left foot"] = Left,
            ["left footed"] = Left,
            ["left-footed"] = Left,
            ["lefty"] = Left,

            ["right"] = Right,
            ["r"] = Right,
            ["right foot"] = Right,
            ["right footed"] = Right,
            ["right-footed"] = Right,
            ["righty"] = Right,

            ["both"] = Both,
            ["b"] = Both,
            ["two footed"] = Both,
            ["two-footed"] = Both,
        };

    /// <summary>Normalizes one foot input: empty is allowed (unknown), a known
    /// alias returns the canonical value, and an unrecognized value adds a
    /// validation error naming the field and allowed values.</summary>
    public static string? NormalizeOrError(string? input, string field, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return null;

        if (FootByAlias.TryGetValue(value, out var foot))
            return foot;

        errors.Add($"Unknown foot '{input}' for {field}. Allowed values: {AllowedList}, or leave empty if unknown.");
        return null;
    }

    /// <summary>Canonical foot values joined as ", "-separated text, for
    /// validation error messages.</summary>
    public static string AllowedList
        => string.Join(", ", FeetList);
}
