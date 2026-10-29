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

    // ── Seasons ─────────────────────────────────────────────────────────

    [HttpGet("{id:int}/seasons")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeasons(int id)
    {
        if (await _service.GetByIdAsync(id) is null) return NotFound();
        return Ok(await _service.GetSeasonsAsync(id));
    }

    [HttpGet("{id:int}/seasons/{seasonId:int}", Name = "GetSeason")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeason(int id, int seasonId)
    {
        var season = await _service.GetSeasonAsync(id, seasonId);
        return season is null ? NotFound() : Ok(season);
    }

    [HttpPost("{id:int}/seasons")]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> CreateSeason(int id, [FromBody] CreateCompetitionSeasonDto dto)
    {
        if (await _service.GetByIdAsync(id) is null) return NotFound();

        var errors = new List<string>();
        var season = await _service.CreateSeasonAsync(id, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        if (season is null)
            return Conflict("A season of this competition already uses that label.");
        return CreatedAtAction(nameof(GetSeason), new { id, seasonId = season.SeasonId }, season);
    }

    [HttpPut("{id:int}/seasons/{seasonId:int}")]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> UpdateSeason(
        int id, int seasonId, [FromBody] UpdateCompetitionSeasonDto dto)
    {
        if (await _service.GetSeasonAsync(id, seasonId) is null) return NotFound();

        var errors = new List<string>();
        var season = await _service.UpdateSeasonAsync(id, seasonId, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        return season is null
            ? Conflict("Another season of this competition already uses that label.")
            : Ok(season);
    }

    [HttpDelete("{id:int}/seasons/{seasonId:int}")]
    [HasPermission(Permissions.CompetitionsWrite)]
    public async Task<IActionResult> DeleteSeason(int id, int seasonId)
        => await _service.DeleteSeasonAsync(id, seasonId) ? NoContent() : NotFound();
}
