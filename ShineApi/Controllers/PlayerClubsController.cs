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
        var errors = new List<string>();
        var playerClub = await _service.CreateAsync(dto, errors);
        if (errors.Count > 0)
            return BadRequest(new { errors });

        return CreatedAtAction(nameof(GetById), new { id = playerClub.PlayerClubId }, playerClub);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerClubDto dto)
    {
        var errors = new List<string>();
        var playerClub = await _service.UpdateAsync(id, dto, errors);
        if (errors.Count > 0)
            return BadRequest(new { errors });
        return playerClub is null ? NotFound() : Ok(playerClub);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.PlayersWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    /// <summary>Full career history as a CSV or JSON download (format=csv|json).
    /// Player and club names are resolved; one row per club stint.</summary>
    [HttpGet("export")]
    [AllowAnonymous]
    public async Task<IActionResult> Export([FromQuery] string format = "csv")
    {
        var file = await _service.ExportAsync(format);
        if (file is null)
            return BadRequest(new { errors = new[] { "format must be 'csv' or 'json'." } });

        return File(file.Content, file.ContentType, file.FileName);
    }
}
