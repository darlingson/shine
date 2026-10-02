namespace ShineApi.Authorization;

/// <summary>
/// Permission strings. Access control checks these — roles are just bundles.
/// A user can hold permissions directly without changing their role.
/// </summary>
public static class Permissions
{
    public const string ClaimType = "permission";

    public const string PlayersRead = "players:read";
    public const string PlayersWrite = "players:write";

    public const string ClubsRead = "clubs:read";
    public const string ClubsWrite = "clubs:write";

    public const string MatchesRead = "matches:read";
    public const string MatchesWrite = "matches:write";

    public const string SquadsRead = "squads:read";
    public const string SquadsWrite = "squads:write";

    public const string UsersManage = "users:manage";
    public const string PermissionsGrant = "permissions:grant";

    public static string PolicyFor(string permission) => $"perm:{permission}";

    public static readonly string[] All =
    [
        PlayersRead, PlayersWrite,
        ClubsRead, ClubsWrite,
        MatchesRead, MatchesWrite,
        SquadsRead, SquadsWrite,
        UsersManage, PermissionsGrant,
    ];
}

/// <summary>
/// Role names. Each role is a bundle of permissions (see <see cref="RolePermissions"/>).
/// </summary>
public static class Roles
{
    public const string Admin = "Admin";
    public const string Editor = "Editor";
    public const string Viewer = "Viewer";
}

/// <summary>
/// Default permission bundles per role. Admins get everything.
/// </summary>
public static class RolePermissions
{
    public static readonly IReadOnlyDictionary<string, string[]> Map = new Dictionary<string, string[]>
    {
        [Roles.Admin] =
        [
            Permissions.PlayersRead, Permissions.PlayersWrite,
            Permissions.ClubsRead, Permissions.ClubsWrite,
            Permissions.MatchesRead, Permissions.MatchesWrite,
            Permissions.SquadsRead, Permissions.SquadsWrite,
            Permissions.UsersManage, Permissions.PermissionsGrant,
        ],
        [Roles.Editor] =
        [
            Permissions.PlayersRead, Permissions.PlayersWrite,
            Permissions.ClubsRead, Permissions.ClubsWrite,
            Permissions.MatchesRead, Permissions.MatchesWrite,
            Permissions.SquadsRead, Permissions.SquadsWrite,
        ],
        [Roles.Viewer] =
        [
            Permissions.PlayersRead,
            Permissions.ClubsRead,
            Permissions.MatchesRead,
            Permissions.SquadsRead,
        ],
    };
}
