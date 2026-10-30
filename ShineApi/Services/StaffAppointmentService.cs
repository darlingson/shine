using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class StaffAppointmentService : IStaffAppointmentService
{
    private readonly IStaffAppointmentRepository _repository;

    public StaffAppointmentService(IStaffAppointmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<StaffAppointment>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<StaffAppointmentDto>> GetPageAsync(StaffAppointmentQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<StaffAppointmentDto>
        {
            Items = [.. items.Select(ToDto)],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<StaffAppointmentDto?> GetByIdAsync(int id)
    {
        var appointment = await _repository.GetWithTeamsByIdAsync(id);
        return appointment is null ? null : ToDto(appointment);
    }

    public async Task<StaffAppointment?> CreateAsync(CreateStaffAppointmentDto dto, List<string> errors)
    {
        var role = StaffRoles.NormalizeRoleOrError(dto.Role, errors);
        await ValidateTeamChoiceAsync(dto.StaffMemberId, dto.ClubId, dto.NationalTeamId, errors);
        ValidateDates(dto.StartDate, dto.EndDate, errors);

        // Rejected before persisting — a validation failure must not write a row.
        if (errors.Count > 0) return null;

        if (await _repository.DuplicateExistsAsync(
                dto.StaffMemberId!.Value, role!, dto.ClubId, dto.NationalTeamId, dto.StartDate))
            return null;

        var appointment = new StaffAppointment
        {
            StaffMemberId = dto.StaffMemberId!.Value,
            Role = role!,
            ClubId = dto.ClubId,
            NationalTeamId = dto.NationalTeamId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(appointment);
        await _repository.SaveChangesAsync();
        return appointment;
    }

    public async Task<StaffAppointment?> UpdateAsync(int id, UpdateStaffAppointmentDto dto, List<string> errors)
    {
        var appointment = await _repository.GetByIdAsync(id);
        if (appointment is null) return null;

        var role = StaffRoles.NormalizeRoleOrError(dto.Role, errors);
        await ValidateTeamChoiceAsync(dto.StaffMemberId, dto.ClubId, dto.NationalTeamId, errors);
        ValidateDates(dto.StartDate, dto.EndDate, errors);

        if (errors.Count > 0)
        {
            // Rejected before persisting — leave the loaded appointment untouched.
            return appointment;
        }

        if (await _repository.DuplicateExistsAsync(
                dto.StaffMemberId!.Value, role!, dto.ClubId, dto.NationalTeamId, dto.StartDate, id))
            return null;

        appointment.StaffMemberId = dto.StaffMemberId!.Value;
        appointment.Role = role!;
        appointment.ClubId = dto.ClubId;
        appointment.NationalTeamId = dto.NationalTeamId;
        appointment.StartDate = dto.StartDate;
        appointment.EndDate = dto.EndDate;
        appointment.SourceUrl = dto.SourceUrl;
        appointment.UpdatedAt = DateTime.UtcNow;

        _repository.Update(appointment);
        await _repository.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var appointment = await _repository.GetByIdAsync(id);
        if (appointment is null) return false;

        _repository.Delete(appointment);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>The team choice rules: the appointment needs exactly one team.
    /// An unattached member (neither FK set) is checked too.</summary>
    private async Task ValidateTeamChoiceAsync(
        int? staffMemberId, int? clubId, int? nationalTeamId, List<string> errors)
    {
        if (staffMemberId is null)
        {
            errors.Add("Staff member is required.");
            return;
        }

        if (!await _repository.StaffMemberExistsAsync(staffMemberId.Value))
            errors.Add($"There is no staff member with id {staffMemberId.Value}.");

        if (clubId is null && nationalTeamId is null)
        {
            errors.Add("Specify one of club / national team — an appointment is at exactly one team.");
            return;
        }

        if (clubId is not null && nationalTeamId is not null)
        {
            errors.Add("An appointment belongs to either a club or a national team, not both.");
            return;
        }

        if (clubId is { } cid && !await _repository.ClubExistsAsync(cid))
            errors.Add($"There is no club with id {cid}.");

        if (nationalTeamId is { } tid && !await _repository.NationalTeamExistsAsync(tid))
            errors.Add($"There is no national team with id {tid}.");
    }

    private static void ValidateDates(DateOnly? startDate, DateOnly? endDate, List<string> errors)
    {
        if (startDate is not null && endDate is not null && endDate < startDate)
            errors.Add("An appointment cannot end before it starts.");
    }

    private static StaffAppointmentDto ToDto(StaffAppointment a)
        => new()
        {
            StaffAppointmentId = a.StaffAppointmentId,
            StaffMemberId = a.StaffMemberId,
            StaffMemberName = a.StaffMember?.KnownAs ?? a.StaffMember?.FullName,
            Role = a.Role,
            ClubId = a.ClubId,
            ClubName = a.Club?.Name,
            NationalTeamId = a.NationalTeamId,
            NationalTeamName = a.NationalTeam?.Name,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            SourceUrl = a.SourceUrl
        };
}
