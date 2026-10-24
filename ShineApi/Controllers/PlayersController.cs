using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
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
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] PlayerQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("filter-options")]
    [AllowAnonymous]
    public async Task<IActionResult> FilterOptions()
        => Ok(await _service.GetFilterOptionsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var player = await _service.GetByIdAsync(id);
        return player is null ? NotFound() : Ok(player);
    }

    /// <summary>Full player list as a CSV or JSON download (format=csv|json).</summary>
    [HttpGet("export")]
    [AllowAnonymous]
    public async Task<IActionResult> Export([FromQuery] string format = "csv")
    {
        var file = await _service.ExportAsync(format);
        if (file is null)
            return BadRequest(new { errors = new[] { "format must be 'csv' or 'json'." } });

        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpPost]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Create([FromBody] CreatePlayerDto dto)
    {
        var player = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = player.PlayerId }, player);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerDto dto)
    {
        var player = await _service.UpdateAsync(id, dto);
        return player is null ? NotFound() : Ok(player);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
