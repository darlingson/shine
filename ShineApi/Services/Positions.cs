namespace ShineApi.Services;

/// <summary>Canonical pitch-position vocabulary used across players, squads and
/// affiliations. Two linked concepts:
///
/// - Position: where a player is used on the pitch — a granular code (e.g. CB)
///   or the generic code of their area (e.g. DF) when a source isn't more
///   specific. Generic and granular codes are both valid canonical values.
/// - Role: the coarse area of the pitch — GK / DF / MF / FW. Never user input;
///   always derived from the position code.</summary>
public static class Positions
{
    /// <summary>Every canonical position code: generic area codes plus granular
    /// spots within them.</summary>
    public static readonly IReadOnlyList<string> PositionsList =
    [
        GoalkeeperRole, // GK
        "DF", "CB", "LB", "RB",
        "MF", "DM", "CM", "AM",
        "FW", "LW", "RW", "ST",
    ];

    public const string GoalkeeperRole = "GK";
    public const string DefenderRole = "DF";
    public const string MidfielderRole = "MF";
    public const string ForwardRole = "FW";

    /// <summary>Role for every canonical position code, granular or generic.</summary>
    private static readonly IReadOnlyDictionary<string, string> RoleByPosition =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [GoalkeeperRole] = GoalkeeperRole,
            ["DF"] = DefenderRole,
            ["CB"] = DefenderRole,
            ["LB"] = DefenderRole,
            ["RB"] = DefenderRole,
            ["MF"] = MidfielderRole,
            ["DM"] = MidfielderRole,
            ["CM"] = MidfielderRole,
            ["AM"] = MidfielderRole,
            ["FW"] = ForwardRole,
            ["LW"] = ForwardRole,
            ["RW"] = ForwardRole,
            ["ST"] = ForwardRole,
        };

    /// <summary>Accepted spellings (case-insensitive, trimmed) to canonical
    /// position codes. "Defender" means a defender with an unknown exact spot,
    /// so it maps to the generic DF code rather than being an error.</summary>
    private static readonly IReadOnlyDictionary<string, string> PositionByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Goalkeeper
            ["GK"] = GoalkeeperRole,
            ["goalkeeper"] = GoalkeeperRole,
            ["keeper"] = GoalkeeperRole,
            ["goalie"] = GoalkeeperRole,

            // Defenders
            ["DF"] = "DF",
            ["defender"] = "DF",
            ["CB"] = "CB",
            ["centerback"] = "CB",
            ["centreback"] = "CB",
            ["center back"] = "CB",
            ["centre back"] = "CB",
            ["center-back"] = "CB",
            ["centre-back"] = "CB",
            ["central defender"] = "CB",
            ["LB"] = "LB",
            ["leftback"] = "LB",
            ["left back"] = "LB",
            ["left-back"] = "LB",
            ["RB"] = "RB",
            ["rightback"] = "RB",
            ["right back"] = "RB",
            ["right-back"] = "RB",

            // Midfielders
            ["MF"] = "MF",
            ["midfielder"] = "MF",
            ["midfield"] = "MF",
            ["DM"] = "DM",
            ["defensivemidfielder"] = "DM",
            ["defensive midfielder"] = "DM",
            ["defensive midfield"] = "DM",
            ["defensive mid"] = "DM",
            ["CM"] = "CM",
            ["centralmidfielder"] = "CM",
            ["central midfielder"] = "CM",
            ["central midfield"] = "CM",
            ["center midfielder"] = "CM",
            ["centre midfielder"] = "CM",
            ["central mid"] = "CM",
            ["AM"] = "AM",
            ["attackingmidfielder"] = "AM",
            ["attacking midfielder"] = "AM",
            ["attacking midfield"] = "AM",
            ["attacking mid"] = "AM",
            ["LM"] = "LM",
            ["left midfielder"] = "LM",
            ["left mid"] = "LM",
            ["RM"] = "RM",
            ["right midfielder"] = "RM",
            ["right mid"] = "RM",

            // Forwards
            ["FW"] = "FW",
            ["forward"] = "FW",
            ["striker"] = "ST",
            ["ST"] = "ST",
            ["centre forward"] = "ST",
            ["center forward"] = "ST",
            ["LW"] = "LW",
            ["left winger"] = "LW",
            ["left wing"] = "LW",
            ["RW"] = "RW",
            ["right winger"] = "RW",
            ["right wing"] = "RW",

            // Side-unknown winger falls back to the generic forward code.
            ["winger"] = "FW",
        };

    /// <summary>Result of normalizing one position input.</summary>
    public record Normalized(string Position, string Role);

    /// <summary>Empty/null input → (null, null). Known alias → canonical pair.
    /// Unknown non-empty input → (null, null) and <paramref name="known"/> is
    /// false; callers decide whether that is an error. Never throws.</summary>
    public static (Normalized? Result, bool Known) TryNormalize(string? input)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
            return (null, true);

        if (PositionByAlias.TryGetValue(value, out var position)
            && RoleByPosition.TryGetValue(position, out var role))
            return (new Normalized(position, role), true);

        return (null, false);
    }

    /// <summary>Canonical position codes joined as "; "-separated text, for
    /// validation error messages.</summary>
    public static string AllowedList
        => string.Join(", ", PositionsList);
}
