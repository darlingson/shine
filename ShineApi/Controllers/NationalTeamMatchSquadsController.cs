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

    [HttpGet("{matchId:int}/{playerId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int matchId, int playerId, [FromQuery] string nationalTeam)
    {
        var squad = await _service.GetByIdAsync(matchId, nationalTeam, playerId);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpPost]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateNationalTeamMatchSquadDto dto)
    {
        var squad = await _service.CreateAsync(dto);
        if (squad is null) return Conflict("Squad entry with the same keys already exists.");
        return CreatedAtAction(nameof(GetById),
            new { matchId = squad.MatchId, playerId = squad.PlayerId, nationalTeam = squad.NationalTeam }, squad);
    }

    [HttpPut("{matchId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Update(int matchId, int playerId, [FromQuery] string nationalTeam, [FromBody] UpdateNationalTeamMatchSquadDto dto)
    {
        var squad = await _service.UpdateAsync(matchId, nationalTeam, playerId, dto);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpDelete("{matchId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Delete(int matchId, int playerId, [FromQuery] string nationalTeam)
        => await _service.DeleteAsync(matchId, nationalTeam, playerId) ? NoContent() : NotFound();
}
