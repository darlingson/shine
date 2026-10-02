using Microsoft.AspNetCore.Identity;

namespace ShineApi.Authorization;

/// <summary>
/// Ensures the role bundles (Admin/Editor/Viewer) exist.
/// Safe to call on every startup.
/// </summary>
public static class RoleSeeder
{
    public static async Task EnsureAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var name in new[] { Roles.Admin, Roles.Editor, Roles.Viewer })
        {
            if (!await roles.RoleExistsAsync(name))
            {
                await roles.CreateAsync(new IdentityRole(name));
            }
        }
    }
}
