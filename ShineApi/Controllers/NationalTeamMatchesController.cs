using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NationalTeamMatchesController : ControllerBase
{
    private readonly INationalTeamMatchService _service;

    public NationalTeamMatchesController(INationalTeamMatchService service)
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
    public async Task<IActionResult> Create([FromBody] CreateNationalTeamMatchDto dto)
    {
        var match = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = match.MatchId }, match);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateNationalTeamMatchDto dto)
    {
        var match = await _service.UpdateAsync(id, dto);
        return match is null ? NotFound() : Ok(match);
    }

    /// <summary>Sets or corrects the two national teams on an existing match.</summary>
    [HttpPatch("{id:int}/teams")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> LinkTeams(int id, [FromBody] LinkNationalTeamMatchTeamsDto dto)
    {
        var match = await _service.LinkTeamsAsync(id, dto);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.MatchesWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
