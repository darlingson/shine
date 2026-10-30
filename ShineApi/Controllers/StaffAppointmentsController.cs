using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffAppointmentsController : ControllerBase
{
    private readonly IStaffAppointmentService _service;

    public StaffAppointmentsController(IStaffAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>The team's staff list over time — filter by club or
    /// national team, plus role/ongoing/period filters for browsers.</summary>
    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] StaffAppointmentQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _service.GetByIdAsync(id);
        return appointment is null ? NotFound() : Ok(appointment);
    }

    [HttpPost]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Create([FromBody] CreateStaffAppointmentDto dto)
    {
        var errors = new List<string>();
        var appointment = await _service.CreateAsync(dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        if (appointment is null)
            return Conflict(
                "This staff member already has that role starting on that date at this team.");

        return CreatedAtAction(nameof(GetById), new { id = appointment.StaffAppointmentId }, appointment);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffAppointmentDto dto)
    {
        if (await _service.GetByIdAsync(id) is null) return NotFound();

        var errors = new List<string>();
        var appointment = await _service.UpdateAsync(id, dto, errors);
        if (errors.Count > 0) return BadRequest(new { errors });
        return appointment is null
            ? Conflict(
                "This staff member already has that role starting on that date at this team.")
            : Ok(appointment);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
