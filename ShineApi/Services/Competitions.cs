namespace ShineApi.Services;

/// <summary>Canonical competition vocabulary: what a competition is (league or
/// cup), where it sits in the pyramid (tier — leagues only) and who it is for
/// (scope, plus a region for regional ones). These live on the stable
/// competition identity; sponsor-driven name changes accrue on its seasons
/// instead of renaming the competition.</summary>
public static class Competitions
{
    public const string League = "league";
    public const string Cup = "cup";

    public static readonly IReadOnlyList<string> KindsList = [League, Cup];

    public const string National = "national";
    public const string Regional = "regional";
    public const string Continental = "continental";
    public const string International = "international";

    public static readonly IReadOnlyList<string> ScopesList =
        [National, Regional, Continental, International];

    /// <summary>Malawi's three regional legs, by convention ("Chibuku Southern
    /// Region League" is the tier-2 competition for the south). Other values
    /// are stored free-text — e.g. "cosafa" for a southern-African
    /// national-team competition.</summary>
    public const string South = "south";
    public const string Centre = "centre";
    public const string North = "north";

    private static readonly IReadOnlyDictionary<string, string> KindByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["league"] = League,
            ["leagues"] = League,
            ["cup"] = Cup,
            ["cups"] = Cup,
        };

    private static readonly IReadOnlyDictionary<string, string> ScopeByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["national"] = National,
            ["regional"] = Regional,
            ["region"] = Regional,
            ["continental"] = Continental,
            ["continent"] = Continental,
            ["international"] = International,
            ["world"] = International,
            ["global"] = International,
        };

    private static readonly IReadOnlyDictionary<string, string> RegionByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["south"] = South,
            ["southern"] = South,
            ["centre"] = Centre,
            ["central"] = Centre,
            ["north"] = North,
            ["northern"] = North,
        };

    /// <summary>Normalizes the competition kind. Empty is an error — kind is
    /// how "fam cup" differs from "super league" structurally.</summary>
    public static string? NormalizeKindOrError(string? input, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
        {
            errors.Add("Competition kind is required. Allowed values: " + AllowedKinds + ".");
            return null;
        }

        if (KindByAlias.TryGetValue(value, out var kind))
            return kind;

        errors.Add($"Unknown competition kind '{input}'. Allowed values: {AllowedKinds}.");
        return null;
    }

    /// <summary>Normalizes the competition scope. Empty is allowed — it means
    /// unknown, e.g. an old cup whose reach nobody recorded.</summary>
    public static string? NormalizeScopeOrError(string? input, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return null;

        if (ScopeByAlias.TryGetValue(value, out var scope))
            return scope;

        errors.Add($"Unknown competition scope '{input}'. Allowed values: {AllowedScopes}, or leave empty if unknown.");
        return null;
    }

    /// <summary>Normalizes the region. Known Malawi regions get canonical
    /// values; anything else is kept as trimmed free-text (a regional
    /// competition's reach is not always a Malawi region, e.g. "cosafa").</summary>
    public static string? NormalizeRegionOrError(string? input, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return null;

        if (RegionByAlias.TryGetValue(value, out var region))
            return region;

        return value;
    }

    /// <summary>Cross-field classification rules: a pyramid tier only means
    /// something for leagues, and a region only for regional competitions.</summary>
    public static void ValidateClassificationOrError(
        string? kind, int? tier, string? scope, string? region, List<string> errors)
    {
        if (tier is not null && kind is not League)
            errors.Add("A competition tier only applies to leagues — leave it empty for cups.");

        if (tier is not null && tier < 1)
            errors.Add("A competition tier must be 1 (top flight) or greater.");

        if (region is not null && scope is not Regional)
            errors.Add($"A region only applies to regional competitions (scope '{Regional}').");
    }

    public static string AllowedKinds
        => string.Join(", ", KindsList);

    public static string AllowedScopes
        => string.Join(", ", ScopesList);
}
