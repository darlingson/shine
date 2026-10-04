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
}
