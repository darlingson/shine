using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompetitionsController : ControllerBase
{
    private readonly ICompetitionService _service;

    public CompetitionsController(ICompetitionService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] CompetitionQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("filter-options")]
    [AllowAnonymous]
    public async Task<IActionResult> FilterOptions()
        => Ok(await _service.GetFilterOptionsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var competition = await _service.GetByIdAsync(id);
        return competition is null ? NotFound() : Ok(competition);
    }

    [HttpPost]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> Create([FromBody] CreateCompetitionDto dto)
    {
        var errors = new List<string>();
        var competition = await _service.CreateAsync(dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        if (competition is null)
            return Conflict("A competition with that name already exists.");
        return CreatedAtAction(nameof(GetById), new { id = competition.CompetitionId }, competition);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCompetitionDto dto)
    {
        if (await _service.GetByIdAsync(id) is null) return NotFound();

        var errors = new List<string>();
        var competition = await _service.UpdateAsync(id, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        return competition is null
            ? Conflict("Another competition already uses that name.")
            : Ok(competition);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
