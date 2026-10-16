using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
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
        return CreatedAtAction("GetById", "Matches", new { id = result.MatchId }, result);
    }

    [HttpGet("review-flags")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> ReviewFlags(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (status is not null &&
            !string.Equals(status, "open", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "resolved", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { errors = new[] { "status must be 'open' or 'resolved'." } });
        return Ok(await _service.GetFlagsAsync(status, page, pageSize));
    }

    [HttpPatch("review-flags/{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> ResolveFlag(int id, [FromBody] ResolveFlagDto dto)
    {
        if (!string.Equals(dto.Status, "open", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(dto.Status, "resolved", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { errors = new[] { "Status must be 'open' or 'resolved'." } });
        var flag = await _service.ResolveFlagAsync(id, dto.Status);
        if (flag is null) return NotFound();
        return Ok(flag);
    }

    [HttpDelete("review-flags/{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> DeleteFlag(int id)
        => await _service.DeleteFlagAsync(id) ? NoContent() : NotFound();
}
