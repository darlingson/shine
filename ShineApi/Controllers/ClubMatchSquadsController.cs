using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClubMatchSquadsController : ControllerBase
{
    private readonly IClubMatchSquadService _service;

    public ClubMatchSquadsController(IClubMatchSquadService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{matchId:int}/{clubId:int}/{playerId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int matchId, int clubId, int playerId)
    {
        var squad = await _service.GetByIdAsync(matchId, clubId, playerId);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpPost]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateClubMatchSquadDto dto)
    {
        var squad = await _service.CreateAsync(dto);
        if (squad is null) return Conflict("Squad entry with the same keys already exists.");
        return CreatedAtAction(nameof(GetById),
            new { matchId = squad.MatchId, clubId = squad.ClubId, playerId = squad.PlayerId }, squad);
    }

    [HttpPut("{matchId:int}/{clubId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Update(int matchId, int clubId, int playerId, [FromBody] UpdateClubMatchSquadDto dto)
    {
        var squad = await _service.UpdateAsync(matchId, clubId, playerId, dto);
        return squad is null ? NotFound() : Ok(squad);
    }

    [HttpDelete("{matchId:int}/{clubId:int}/{playerId:int}")]
    [HasPermission(Permissions.SquadsWrite)]
    public async Task<IActionResult> Delete(int matchId, int clubId, int playerId)
        => await _service.DeleteAsync(matchId, clubId, playerId) ? NoContent() : NotFound();
}
