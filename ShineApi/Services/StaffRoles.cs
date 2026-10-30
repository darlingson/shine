namespace ShineApi.Services;

/// <summary>Canonical staff-role vocabulary, enforced on write. Codes are
/// snake_case because they travel whole through the API, search index and
/// exports — consumers match on them, so they must never drift. "The coach"
/// for display purposes resolves in priority order
/// head_coach → manager → caretaker among ongoing appointments.</summary>
public static class StaffRoles
{
    public const string HeadCoach = "head_coach";
    public const string Manager = "manager";
    public const string AssistantCoach = "assistant_coach";
    public const string GoalkeeperCoach = "goalkeeper_coach";
    public const string FitnessCoach = "fitness_coach";
    public const string Caretaker = "caretaker";
    public const string TechnicalDirector = "technical_director";
    public const string Other = "other";

    public static readonly IReadOnlyList<string> RolesList =
    [
        HeadCoach,
        Manager,
        AssistantCoach,
        GoalkeeperCoach,
        FitnessCoach,
        Caretaker,
        TechnicalDirector,
        Other,
    ];

    private static readonly IReadOnlyDictionary<string, string> RoleByAlias =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["head_coach"] = HeadCoach,
            ["headcoach"] = HeadCoach,
            ["chief_coach"] = HeadCoach,
            ["manager"] = Manager,
            ["team_manager"] = Manager,
            ["assistant_coach"] = AssistantCoach,
            ["assistant"] = AssistantCoach,
            ["deputy_coach"] = AssistantCoach,
            ["goalkeeper_coach"] = GoalkeeperCoach,
            ["gk_coach"] = GoalkeeperCoach,
            ["gkcoach"] = GoalkeeperCoach,
            ["goalkeeping_coach"] = GoalkeeperCoach,
            ["keepers_coach"] = GoalkeeperCoach,
            ["goalkeeper_trainer"] = GoalkeeperCoach,
            ["fitness_coach"] = FitnessCoach,
            ["physical_trainer"] = FitnessCoach,
            ["trainer"] = FitnessCoach,
            ["fitness_trainer"] = FitnessCoach,
            ["caretaker"] = Caretaker,
            ["caretaker_coach"] = Caretaker,
            ["caretaker_manager"] = Caretaker,
            ["interim_coach"] = Caretaker,
            ["interim"] = Caretaker,
            ["technical_director"] = TechnicalDirector,
            ["td"] = TechnicalDirector,
            ["sporting_director"] = TechnicalDirector,
            ["other"] = Other,
        };

    /// <summary>Normalizes a staff role. Empty is an error — an appointment
    /// without a role is a row nobody can interpret.</summary>
    public static string? NormalizeRoleOrError(string? input, List<string> errors)
    {
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value))
        {
            errors.Add("Role is required. Allowed values: " + AllowedRoles + ".");
            return null;
        }

        // Shaped inputs ("head coach", "Head Coach") collapse to the code.
        var shaped = value.ToLowerInvariant().Replace(' ', '_').Replace('-', '_');
        if (RoleByAlias.TryGetValue(shaped, out var role))
            return role;

        errors.Add($"Unknown staff role '{input}'. Allowed values: {AllowedRoles}.");
        return null;
    }

    /// <summary>Whether the canonical role code counts as a head-coach-type
    /// appointment for the derived "coach" display, in priority order.</summary>
    public static int CoachPriority(string role)
        => role switch
        {
            HeadCoach => 0,
            Manager => 1,
            Caretaker => 2,
            _ => int.MaxValue,
        };

    public static string AllowedRoles
        => string.Join(", ", RolesList);
}
