using Microsoft.AspNetCore.Mvc;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchService _service;

    public MatchesController(IMatchService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var match = await _service.GetByIdAsync(id);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMatchDto dto)
    {
        var match = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = match.MatchId }, match);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMatchDto dto)
    {
        var match = await _service.UpdateAsync(id, dto);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
