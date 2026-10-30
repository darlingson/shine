using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Authorization;
using ShineApi.Dtos;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffMembersController : ControllerBase
{
    private readonly IStaffMemberService _service;

    public StaffMembersController(IStaffMemberService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("query")]
    [AllowAnonymous]
    public async Task<IActionResult> Query([FromQuery] StaffMemberQuery query)
        => Ok(await _service.GetPageAsync(query));

    [HttpGet("filter-options")]
    [AllowAnonymous]
    public async Task<IActionResult> FilterOptions()
        => Ok(await _service.GetFilterOptionsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var staffMember = await _service.GetByIdAsync(id);
        return staffMember is null ? NotFound() : Ok(staffMember);
    }

    [HttpPost]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Create([FromBody] CreateStaffMemberDto dto)
    {
        var errors = new List<string>();
        var staffMember = await _service.CreateAsync(dto, errors);
        if (errors.Count > 0 || staffMember is null) return BadRequest(new { errors });

        return CreatedAtAction(nameof(GetById), new { id = staffMember.StaffMemberId }, staffMember);
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffMemberDto dto)
    {
        var errors = new List<string>();
        var staffMember = await _service.UpdateAsync(id, dto, errors);
        if (errors.Count > 0)
            return BadRequest(new { errors });
        return staffMember is null ? NotFound() : Ok(staffMember);
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.StaffWrite)]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
