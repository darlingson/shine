using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NationalTeamsController : ControllerBase
{
    private readonly INationalTeamService _service;

    public NationalTeamsController(INationalTeamService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] NationalTeamQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("filter-options")]
    [AllowAnonymous]
    public async Task<IActionResult> FilterOptions()
        => Ok(await _service.GetFilterOptionsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var nationalTeam = await _service.GetByIdAsync(id);
        return nationalTeam is null ? NotFound() : Ok(nationalTeam);
    }

    [HttpPost]
    [HasPermission(Permissions.NationalTeamsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateNationalTeamDto dto)
    {
        var nationalTeam = await _service.CreateAsync(dto);
        if (nationalTeam is null)
            return Conflict("A national team with that name already exists.");
        return CreatedAtAction(nameof(GetById), new { id = nationalTeam.NationalTeamId }, nationalTeam);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.NationalTeamsWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateNationalTeamDto dto)
    {
        if (await _service.GetByIdAsync(id) is null) return NotFound();

        var nationalTeam = await _service.UpdateAsync(id, dto);
        return nationalTeam is null
            ? Conflict("Another team already uses that name.")
            : Ok(nationalTeam);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.NationalTeamsWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    /// <summary>Full national team list as a CSV or JSON download (format=csv|json).</summary>
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
