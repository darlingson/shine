namespace ShineApi.Models;

/// <summary>
/// Direct permission grant to a user, independent of their role.
/// Roles remain bundles of permissions; revoking here never changes the role.
/// Composite key: (UserId, Permission).
/// </summary>
public class UserPermission
{
    public string UserId { get; set; } = "";

    public string Permission { get; set; } = "";

    public DateTimeOffset GrantedAt { get; set; }
}
