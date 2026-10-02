using Microsoft.AspNetCore.Authorization;

namespace ShineApi.Authorization;

/// <summary>
/// Usage: [HasPermission(Permissions.PlayersWrite)].
/// Public reads stay [AllowAnonymous]; writes require a permission.
/// </summary>
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
    {
        Policy = Permissions.PolicyFor(permission);
    }
}
