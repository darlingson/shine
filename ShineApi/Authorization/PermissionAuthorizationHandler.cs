using Microsoft.AspNetCore.Authorization;

namespace ShineApi.Authorization;

/// <summary>
/// Succeeds when the user carries the required permission claim.
/// Permissions are snapshotted into the short-lived access token
/// (direct grants + role bundles resolved at login/refresh).
/// </summary>
public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.HasClaim(Permissions.ClaimType, requirement.Permission))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
