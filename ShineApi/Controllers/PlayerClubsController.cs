using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerClubsController : ControllerBase
{
    private readonly IPlayerClubService _service;

    public PlayerClubsController(IPlayerClubService service)
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
        var playerClub = await _service.GetByIdAsync(id);
        return playerClub is null ? NotFound() : Ok(playerClub);
    }

    [HttpPost]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Create([FromBody] CreatePlayerClubDto dto)
    {
        var playerClub = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = playerClub.PlayerClubId }, playerClub);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerClubDto dto)
    {
        var playerClub = await _service.UpdateAsync(id, dto);
        return playerClub is null ? NotFound() : Ok(playerClub);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
