using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClubsController : ControllerBase
{
    private readonly IClubService _service;

    public ClubsController(IClubService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] ClubQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("filter-options")]
    [AllowAnonymous]
    public async Task<IActionResult> FilterOptions()
        => Ok(await _service.GetFilterOptionsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var club = await _service.GetByIdAsync(id);
        return club is null ? NotFound() : Ok(club);
    }

    [HttpPost]
    [HasPermission(Permissions.ClubsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateClubDto dto)
    {
        var club = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = club.ClubId }, club);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.ClubsWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClubDto dto)
    {
        var club = await _service.UpdateAsync(id, dto);
        return club is null ? NotFound() : Ok(club);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.ClubsWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    /// <summary>Full club list as a CSV or JSON download (format=csv|json).</summary>
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
