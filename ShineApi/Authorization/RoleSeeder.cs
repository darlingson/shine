using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace ShineApi.Authorization;

/// <summary>
/// Ensures the role bundles (Admin/Editor/Viewer) and a default admin user exist.
/// Safe to call on every startup — skips anything already present.
///
/// Retries up to 5 times with exponential back-off so that a Neon (or any
/// serverless Postgres) cold-start doesn't crash the app before it binds.
/// </summary>
public static class RoleSeeder
{
    public static async Task EnsureAsync(IServiceProvider services)
    {
        const int maxAttempts = 5;
        var delay = TimeSpan.FromSeconds(2);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await RunAsync(services);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogWarning(
                    "Seeder attempt {Attempt}/{Max} failed ({Message}). Retrying in {Delay}s…",
                    attempt, maxAttempts, ex.Message, delay.TotalSeconds);

                await Task.Delay(delay);
                delay *= 2; // exponential back-off: 2s, 4s, 8s, 16s
            }
        }

        // Final attempt — let it throw so the misconfiguration is visible in logs.
        await RunAsync(services);
    }

    private static async Task RunAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;

        var roles = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var users = sp.GetRequiredService<UserManager<IdentityUser>>();
        var config = sp.GetRequiredService<IConfiguration>();

        // ── Roles ──────────────────────────────────────────────────────────
        foreach (var name in new[] { Roles.Admin, Roles.Editor, Roles.Viewer })
        {
            if (!await roles.RoleExistsAsync(name))
                await roles.CreateAsync(new IdentityRole(name));
        }

        // ── Default admin user ─────────────────────────────────────────────
        // Set via user-secrets locally:
        //   dotnet user-secrets set "Seed:AdminEmail"    "you@example.com"
        //   dotnet user-secrets set "Seed:AdminPassword" "YourStrongP@ss1"
        // On Render use env vars: Seed__AdminEmail / Seed__AdminPassword
        var email = config["Seed:AdminEmail"]
            ?? throw new InvalidOperationException("Seed:AdminEmail is not configured.");
        var password = config["Seed:AdminPassword"]
            ?? throw new InvalidOperationException("Seed:AdminPassword is not configured.");

        if (await users.FindByEmailAsync(email) is null)
        {
            var admin = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await users.CreateAsync(admin, password);
            if (result.Succeeded)
                await users.AddToRoleAsync(admin, Roles.Admin);
        }
    }
}
