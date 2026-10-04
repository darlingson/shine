using Microsoft.AspNetCore.Authorization;

namespace ShineApi.Authorization;

/// <summary>
/// Requires a single permission claim (<see cref="Permissions.ClaimType"/>).
/// </summary>
public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
