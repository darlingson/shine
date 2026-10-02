using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShineApi.Authorization;
using ShineApi.Models;

namespace ShineApi.Controllers;

/// <summary>
/// Manage direct permission grants and role membership.
/// Permissions take effect on the next login/refresh (snapshotted in access tokens).
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UserManager<IdentityUser> _users;
    private readonly ShineDbContext _db;

    public UsersController(UserManager<IdentityUser> users, ShineDbContext db)
    {
        _users = users;
        _db = db;
    }

    [HttpGet]
    [HasPermission(Permissions.UsersManage)]
    public async Task<IActionResult> List()
    {
        var users = await _users.Users
            .Select(u => new { u.Id, u.Email, u.UserName })
            .ToListAsync();

        var result = new List<object>();
        foreach (var u in users)
        {
            var identity = await _users.FindByIdAsync(u.Id);
            result.Add(new
            {
                u.Id,
                u.Email,
                u.UserName,
                roles = identity is null ? [] : await _users.GetRolesAsync(identity),
            });
        }

        return Ok(result);
    }

    public sealed class PermissionGrantRequest
    {
        public string Permission { get; set; } = "";
    }

    [HttpPost("{id}/permissions")]
    [HasPermission(Permissions.PermissionsGrant)]
    public async Task<IActionResult> GrantPermission(string id, [FromBody] PermissionGrantRequest model)
    {
        if (!Permissions.All.Contains(model.Permission, StringComparer.Ordinal))
        {
            return BadRequest($"Unknown permission '{model.Permission}'.");
        }

        if (await _users.FindByIdAsync(id) is null)
        {
            return NotFound();
        }

        var exists = await _db.UserPermission.AnyAsync(x => x.UserId == id && x.Permission == model.Permission);
        if (!exists)
        {
            _db.UserPermission.Add(new UserPermission
            {
                UserId = id,
                Permission = model.Permission,
                GrantedAt = DateTimeOffset.UtcNow,
            });
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpDelete("{id}/permissions/{permission}")]
    [HasPermission(Permissions.PermissionsGrant)]
    public async Task<IActionResult> RevokePermission(string id, string permission)
    {
        var row = await _db.UserPermission.SingleOrDefaultAsync(x => x.UserId == id && x.Permission == permission);
        if (row is null)
        {
            return NotFound();
        }

        _db.UserPermission.Remove(row);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    public sealed class RoleAssignRequest
    {
        public string Role { get; set; } = "";
    }

    private static readonly string[] KnownRoles = [Roles.Admin, Roles.Editor, Roles.Viewer];

    [HttpPost("{id}/roles")]
    [HasPermission(Permissions.UsersManage)]
    public async Task<IActionResult> AssignRole(string id, [FromBody] RoleAssignRequest model)
    {
        if (!KnownRoles.Contains(model.Role, StringComparer.Ordinal))
        {
            return BadRequest($"Unknown role '{model.Role}'.");
        }

        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var result = await _users.AddToRoleAsync(user, model.Role);
        return result.Succeeded ? NoContent() : BadRequest(result.Errors);
    }

    [HttpDelete("{id}/roles/{role}")]
    [HasPermission(Permissions.UsersManage)]
    public async Task<IActionResult> RemoveRole(string id, string role)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var result = await _users.RemoveFromRoleAsync(user, role);
        return result.Succeeded ? NoContent() : BadRequest(result.Errors);
    }
}
