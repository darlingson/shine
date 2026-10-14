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
}
