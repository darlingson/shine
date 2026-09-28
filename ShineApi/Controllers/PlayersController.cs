using Microsoft.AspNetCore.Mvc;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _service;

    public PlayersController(IPlayerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var player = await _service.GetByIdAsync(id);
        return player is null ? NotFound() : Ok(player);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlayerDto dto)
    {
        var player = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = player.PlayerId }, player);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerDto dto)
    {
        var player = await _service.UpdateAsync(id, dto);
        return player is null ? NotFound() : Ok(player);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
