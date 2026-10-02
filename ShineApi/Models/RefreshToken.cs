namespace ShineApi.Models;

/// <summary>
/// Persisted refresh token. Only a SHA-256 hash is stored — the raw token
/// is returned to the client once and never persisted.
/// Rotation: on use, the old row is revoked and linked to its replacement.
/// </summary>
public class RefreshToken
{
    public int Id { get; set; }

    public string UserId { get; set; } = "";

    public string TokenHash { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public string? ReplacedByTokenHash { get; set; }

    public bool IsRevoked => RevokedAt.HasValue;

    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;

    public bool IsActive => !IsRevoked && !IsExpired;
}
