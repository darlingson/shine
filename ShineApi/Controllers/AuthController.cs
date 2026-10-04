using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Services.Auth;

namespace ShineApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _users;
    private readonly RoleManager<IdentityRole> _roles;
    private readonly ITokenService _tokens;

    public AuthController(
        UserManager<IdentityUser> users,
        RoleManager<IdentityRole> roles,
        ITokenService tokens)
    {
        _users = users;
        _roles = roles;
        _tokens = tokens;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest model)
    {
        var user = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _users.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        if (!await _roles.RoleExistsAsync(Roles.Viewer))
        {
            await _roles.CreateAsync(new IdentityRole(Roles.Viewer));
        }

        await _users.AddToRoleAsync(user, Roles.Viewer);

        return Ok(await _tokens.IssueTokensAsync(user));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest model)
    {
        var user = await _users.FindByEmailAsync(model.Email);
        if (user is null || !await _users.CheckPasswordAsync(user, model.Password))
        {
            return Unauthorized();
        }

        return Ok(await _tokens.IssueTokensAsync(user));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest model)
    {
        var tokens = await _tokens.RefreshAsync(model.RefreshToken);
        if (tokens is null)
        {
            return Unauthorized();
        }

        return Ok(tokens);
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> Revoke([FromBody] RefreshRequest model)
    {
        var revoked = await _tokens.RevokeAsync(model.RefreshToken);
        return revoked ? NoContent() : NotFound();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (userId is null)
        {
            return Unauthorized();
        }

        await _tokens.RevokeAllForUserAsync(userId);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var user = await _users.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.UserName,
            roles = await _users.GetRolesAsync(user),
            permissions = await _tokens.GetPermissionsAsync(user),
        });
    }
}

public sealed class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public sealed class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public sealed class RefreshRequest
{
    public string RefreshToken { get; set; } = "";
}
