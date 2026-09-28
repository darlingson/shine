using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var club = await _service.GetByIdAsync(id);
        return club is null ? NotFound() : Ok(club);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClubDto dto)
    {
        var club = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = club.ClubId }, club);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClubDto dto)
    {
        var club = await _service.UpdateAsync(id, dto);
        return club is null ? NotFound() : Ok(club);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
