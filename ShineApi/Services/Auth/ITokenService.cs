using Microsoft.AspNetCore.Identity;

namespace ShineApi.Services.Auth;

public sealed record IssuedTokens(string AccessToken, DateTimeOffset AccessExpiresAt, string RefreshToken, DateTimeOffset RefreshExpiresAt);

public interface ITokenService
{
    Task<IssuedTokens> IssueTokensAsync(IdentityUser user);
    Task<IssuedTokens?> RefreshAsync(string refreshToken);
    Task<bool> RevokeAsync(string refreshToken);
    Task RevokeAllForUserAsync(string userId);
    Task<IReadOnlyCollection<string>> GetPermissionsAsync(IdentityUser user);
}
