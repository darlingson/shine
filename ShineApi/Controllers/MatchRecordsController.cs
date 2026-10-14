using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchRecordsController : ControllerBase
{
    private readonly IMatchRecordService _service;

    public MatchRecordsController(IMatchRecordService service)
    {
        _service = service;
    }

    /// <summary>
    /// Records a full match (match + squad rows) in one request.
    /// Teams are existing club ids; players resolve by name (link, link-unverified, or create).
    /// Requires matches:write — it implicitly creates players, affiliations, and squad entries.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Create([FromBody] CreateMatchRecordDto dto)
    {
        var errors = new List<string>();
        var result = await _service.CreateAsync(dto, errors);
        if (result is null) return BadRequest(new { errors });
        return Ok(result);
    }

    [HttpGet("review-flags")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> ReviewFlags([FromServices] ShineDbContext db)
    {
        var flags = await db.ReviewFlag
            .OrderByDescending(f => f.ReviewFlagId)
            .ToListAsync();
        return Ok(flags);
    }

    public sealed class ResolveFlagDto
    {
        public string Status { get; set; } = "resolved";
    }

    [HttpPatch("review-flags/{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> ResolveFlag(int id, [FromBody] ResolveFlagDto dto, [FromServices] ShineDbContext db)
    {
        if (dto.Status != "open" && dto.Status != "resolved") return BadRequest(new { errors = new[] { "Status must be 'open' or 'resolved'." } });
        var flag = await db.ReviewFlag.FindAsync(id);
        if (flag is null) return NotFound();
        flag.Status = dto.Status;
        flag.ResolvedAt = dto.Status == "resolved" ? DateTime.UtcNow : null;
        await db.SaveChangesAsync();
        return Ok(flag);
    }

    [HttpDelete("review-flags/{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> DeleteFlag(int id, [FromServices] ShineDbContext db)
    {
        var flag = await db.ReviewFlag.FindAsync(id);
        if (flag is null) return NotFound();
        db.ReviewFlag.Remove(flag);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
