namespace ShineApi.Services;

/// <summary>Canonical gender vocabulary, aligned with the NationalTeam
/// vocabulary: a player's gender is <c>men</c> or <c>women</c>. ("mixed" is a
/// national-team concept and never applies to a player.) Empty is allowed —
/// it means unknown.</summary>
public static class Genders
{
    public const string Men = "men";
    public const string Women = "women";

    public static readonly IReadOnlyList<string> GendersList = [Men, Women];

    /// <summary>Accepted spellings (case-insensitive, trimmed) to canonical
    /// values — covers the free-text shorthands seen in the source data.</summary>
    private static readonly IReadOnlyDictionary<string, string> GenderByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["men"] = Men,
            ["man"] = Men,
            ["male"] = Men,
            ["m"] = Men,

            ["women"] = Women,
            ["woman"] = Women,
            ["female"] = Women,
            ["f"] = Women,
        };

    /// <summary>Normalizes one gender input: empty is allowed (unknown), a
    /// known alias returns the canonical value, and an unrecognized value adds
    /// a validation error naming the field and allowed values.</summary>
    public static string? NormalizeOrError(string? input, string field, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return null;

        if (GenderByAlias.TryGetValue(value, out var gender))
            return gender;

        errors.Add($"Unknown gender '{input}' for {field}. Allowed values: {AllowedList}, or leave empty if unknown.");
        return null;
    }

    /// <summary>Canonical gender values joined as ", "-separated text, for
    /// validation error messages.</summary>
    public static string AllowedList
        => string.Join(", ", GendersList);
}
