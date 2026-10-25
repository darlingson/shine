namespace ShineApi.Services;

/// <summary>Canonical player status vocabulary: <c>active</c>, <c>retired</c>
/// or <c>unknown</c>. Empty is allowed — create falls back to <c>active</c>
/// (the model default) and update keeps the stored value.</summary>
public static class PlayerStatuses
{
    public const string Active = "active";
    public const string Retired = "retired";
    public const string Unknown = "unknown";

    public static readonly IReadOnlyList<string> StatusesList = [Active, Retired, Unknown];

    /// <summary>Accepted spellings (case-insensitive, trimmed) to canonical
    /// values — covers the free-text shorthands seen in the source data.</summary>
    private static readonly IReadOnlyDictionary<string, string> StatusByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["active"] = Active,
            ["current"] = Active,

            ["retired"] = Retired,
            ["former"] = Retired,

            ["unknown"] = Unknown,
            ["unspecified"] = Unknown,
        };

    /// <summary>Normalizes one status input: empty is allowed (no change), a
    /// known alias returns the canonical value, and an unrecognized value adds
    /// a validation error naming the field and allowed values.</summary>
    public static string? NormalizeOrError(string? input, string field, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return null;

        if (StatusByAlias.TryGetValue(value, out var status))
            return status;

        errors.Add($"Unknown status '{input}' for {field}. Allowed values: {AllowedList}, or leave empty to keep the current value.");
        return null;
    }

    /// <summary>Canonical status values joined as ", "-separated text, for
    /// validation error messages.</summary>
    public static string AllowedList
        => string.Join(", ", StatusesList);
}
