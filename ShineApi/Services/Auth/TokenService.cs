using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShineApi.Authorization;
using ShineApi.Models;

namespace ShineApi.Services.Auth;

/// <summary>
/// Issues short-lived JWT access tokens (permission claims snapshotted in)
/// plus opaque rotating refresh tokens (only SHA-256 hash persisted).
/// </summary>
public sealed class TokenService : ITokenService
{
    private readonly UserManager<IdentityUser> _users;
    private readonly ShineDbContext _db;
    private readonly IConfiguration _config;

    public TokenService(UserManager<IdentityUser> users, ShineDbContext db, IConfiguration config)
    {
        _users = users;
        _db = db;
        _config = config;
    }

    private string Key => _config["Jwt:Key"]!;
    private string Issuer => _config["Jwt:Issuer"]!;
    private string Audience => _config["Jwt:Audience"] ?? _config["Jwt:Issuer"]!;
    private int AccessMinutes => int.TryParse(_config["Jwt:AccessExpiryMinutes"], out var m) ? m : 15;
    private int RefreshDays => int.TryParse(_config["Jwt:RefreshExpiryDays"], out var d) ? d : 14;

    public async Task<IReadOnlyCollection<string>> GetPermissionsAsync(IdentityUser user)
    {
        var set = new HashSet<string>(StringComparer.Ordinal);

        foreach (var role in await _users.GetRolesAsync(user))
        {
            if (RolePermissions.Map.TryGetValue(role, out var perms))
            {
                foreach (var p in perms)
                {
                    set.Add(p);
                }
            }
        }

        var direct = await _db.UserPermission
            .Where(x => x.UserId == user.Id)
            .Select(x => x.Permission)
            .ToListAsync();

        foreach (var p in direct)
        {
            set.Add(p);
        }

        return set;
    }

    public async Task<IssuedTokens> IssueTokensAsync(IdentityUser user)
    {
        var permissions = await GetPermissionsAsync(user);
        var accessExpires = DateTimeOffset.UtcNow.AddMinutes(AccessMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.UserName ?? user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(permissions.Select(p => new Claim(Permissions.ClaimType, p)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));
        var jwt = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: accessExpires.UtcDateTime,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);

        var rawRefresh = GenerateOpaqueToken();
        var refreshExpires = DateTimeOffset.UtcNow.AddDays(RefreshDays);
        _db.RefreshToken.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(rawRefresh),
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = refreshExpires,
        });
        await _db.SaveChangesAsync();

        return new IssuedTokens(accessToken, accessExpires, rawRefresh, refreshExpires);
    }

    public async Task<IssuedTokens?> RefreshAsync(string refreshToken)
    {
        var hash = Hash(refreshToken);
        var stored = await _db.RefreshToken.SingleOrDefaultAsync(x => x.TokenHash == hash);

        if (stored is null || !stored.IsActive)
        {
            return null;
        }

        var user = await _users.FindByIdAsync(stored.UserId);
        if (user is null)
        {
            return null;
        }

        // Rotate: revoke the presented token, link to its replacement.
        var rawReplacement = GenerateOpaqueToken();
        stored.RevokedAt = DateTimeOffset.UtcNow;
        stored.ReplacedByTokenHash = Hash(rawReplacement);

        var refreshExpires = DateTimeOffset.UtcNow.AddDays(RefreshDays);
        _db.RefreshToken.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(rawReplacement),
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = refreshExpires,
        });
        await _db.SaveChangesAsync();

        // Issue a fresh access token (permissions re-resolved so revokes take effect on refresh).
        var permissions = await GetPermissionsAsync(user);
        var accessExpires = DateTimeOffset.UtcNow.AddMinutes(AccessMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.UserName ?? user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(permissions.Select(p => new Claim(Permissions.ClaimType, p)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));
        var jwt = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: accessExpires.UtcDateTime,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new IssuedTokens(
            new JwtSecurityTokenHandler().WriteToken(jwt),
            accessExpires,
            rawReplacement,
            refreshExpires);
    }

    public async Task<bool> RevokeAsync(string refreshToken)
    {
        var stored = await _db.RefreshToken.SingleOrDefaultAsync(x => x.TokenHash == Hash(refreshToken));
        if (stored is null || stored.IsRevoked)
        {
            return false;
        }

        stored.RevokedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task RevokeAllForUserAsync(string userId)
    {
        var active = await _db.RefreshToken
            .Where(x => x.UserId == userId && x.RevokedAt == null)
            .ToListAsync();

        foreach (var t in active)
        {
            t.RevokedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    private static string GenerateOpaqueToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

    internal static string Hash(string raw)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
