using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClubMatchesController : ControllerBase
{
    private readonly IClubMatchService _service;

    public ClubMatchesController(IClubMatchService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var match = await _service.GetByIdAsync(id);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpPost]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Create([FromBody] CreateClubMatchDto dto)
    {
        var errors = new List<string>();
        var match = await _service.CreateAsync(dto, errors);
        if (match is null) return BadRequest(new { errors });
        return CreatedAtAction(nameof(GetById), new { id = match.MatchId }, match);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClubMatchDto dto)
    {
        var errors = new List<string>();
        var match = await _service.UpdateAsync(id, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        return match is null ? NotFound() : Ok(match);
    }

    /// <summary>Sets or corrects the two clubs on an existing match.</summary>
    [HttpPatch("{id:int}/teams")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> LinkTeams(int id, [FromBody] LinkClubMatchTeamsDto dto)
    {
        var errors = new List<string>();
        var match = await _service.LinkTeamsAsync(id, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        return match is null ? NotFound() : Ok(match);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
