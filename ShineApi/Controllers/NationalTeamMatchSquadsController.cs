using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NationalTeamMatchSquadsController : ControllerBase
{
    private readonly INationalTeamMatchSquadService _service;

    public NationalTeamMatchSquadsController(INationalTeamMatchSquadService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{matchId:int}/{nationalTeamId:int}/{playerId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int matchId, int nationalTeamId, int playerId)
    {
        var squad = await _service.GetByIdAsync(matchId, nationalTeamId, playerId);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpPost]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateNationalTeamMatchSquadDto dto)
    {
        var errors = new List<string>();
        var squad = await _service.CreateAsync(dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        if (squad is null) return Conflict("Squad entry with the same keys already exists.");
        return CreatedAtAction(nameof(GetById),
            new { matchId = squad.MatchId, nationalTeamId = squad.NationalTeamId, playerId = squad.PlayerId }, squad);
    }

    [HttpPut("{matchId:int}/{nationalTeamId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Update(int matchId, int nationalTeamId, int playerId, [FromBody] UpdateNationalTeamMatchSquadDto dto)
    {
        var squad = await _service.UpdateAsync(matchId, nationalTeamId, playerId, dto);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpDelete("{matchId:int}/{nationalTeamId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Delete(int matchId, int nationalTeamId, int playerId)
        => await _service.DeleteAsync(matchId, nationalTeamId, playerId) ? NoContent() : NotFound();
}
