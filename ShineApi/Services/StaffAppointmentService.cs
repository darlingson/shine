using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class StaffAppointmentService : IStaffAppointmentService
{
    private readonly IStaffAppointmentRepository _repository;
    private readonly IStaffMemberRepository _staffMemberRepository;

    public StaffAppointmentService(
        IStaffAppointmentRepository repository,
        IStaffMemberRepository staffMemberRepository)
    {
        _repository = repository;
        _staffMemberRepository = staffMemberRepository;
    }

    public async Task<IEnumerable<StaffAppointmentDto>> GetAllAsync()
        => [.. (await _repository.GetAllAsync()).Select(ToDto)];

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

    public async Task<StaffAppointmentDto?> CreateAsync(
        CreateStaffAppointmentDto dto, List<string> errors)
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
        return await GetByIdAsync(appointment.StaffAppointmentId);
    }

    public async Task<StaffAppointmentDto?> UpdateAsync(
        int id, UpdateStaffAppointmentDto dto, List<string> errors)
    {
        var appointment = await _repository.GetByIdAsync(id);
        if (appointment is null) return null;

        var role = StaffRoles.NormalizeRoleOrError(dto.Role, errors);
        await ValidateTeamChoiceAsync(dto.StaffMemberId, dto.ClubId, dto.NationalTeamId, errors);
        ValidateDates(dto.StartDate, dto.EndDate, errors);

        if (errors.Count > 0)
        {
            // Rejected before persisting — leave the loaded appointment untouched.
            return null;
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
        return await GetByIdAsync(id);
    }

    public async Task<StaffAppointmentDto?> CreateWithMemberAsync(
        CreateStaffAppointmentWithMemberDto dto, List<string> errors)
    {
        var memberFields = await ValidateMemberFieldsAsync(
            dto.Member.FullName, dto.Member.Nationality, dto.Member.PlayerId, errors);
        var role = StaffRoles.NormalizeRoleOrError(dto.Role, errors);
        await ValidateTeamChoiceAsync(
            null, dto.ClubId, dto.NationalTeamId, errors, requireStaffMember: false);
        ValidateDates(dto.StartDate, dto.EndDate, errors);

        if (errors.Count > 0) return null;
        if (memberFields is not { } fields) return null;

        var member = new StaffMember
        {
            FullName = fields.FullName,
            KnownAs = dto.Member.KnownAs,
            Nationality = fields.Nationality,
            PlayerId = dto.Member.PlayerId,
            SourceUrl = dto.Member.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _staffMemberRepository.AddAsync(member);

        var appointment = new StaffAppointment
        {
            StaffMember = member,
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
        // One SaveChanges for both rows: the pair succeeds or fails together.
        await _repository.SaveChangesAsync();
        return await GetByIdAsync(appointment.StaffAppointmentId);
    }

    public async Task<StaffAppointmentDto?> UpdateWithMemberAsync(
        int id, UpdateStaffAppointmentWithMemberDto dto, List<string> errors)
    {
        var appointment = await _repository.GetByIdAsync(id);
        if (appointment is null) return null;

        var member = await _staffMemberRepository.GetByIdAsync(appointment.StaffMemberId);
        if (member is null)
        {
            errors.Add("Staff member not found.");
            return null;
        }

        var role = StaffRoles.NormalizeRoleOrError(dto.Role, errors);
        await ValidateTeamChoiceAsync(
            appointment.StaffMemberId, dto.ClubId, dto.NationalTeamId, errors);
        ValidateDates(dto.StartDate, dto.EndDate, errors);
        var memberFields = await ValidateMemberFieldsAsync(
            dto.Member.FullName, dto.Member.Nationality, dto.Member.PlayerId, errors);

        if (errors.Count > 0) return null;
        if (memberFields is not { } fields) return null;

        if (await _repository.DuplicateExistsAsync(
                appointment.StaffMemberId, role!, dto.ClubId, dto.NationalTeamId,
                dto.StartDate, id))
            return null;

        member.FullName = fields.FullName;
        member.KnownAs = dto.Member.KnownAs;
        member.Nationality = fields.Nationality;
        member.PlayerId = dto.Member.PlayerId;
        member.SourceUrl = dto.Member.SourceUrl;
        member.UpdatedAt = DateTime.UtcNow;
        _staffMemberRepository.Update(member);

        appointment.Role = role!;
        appointment.ClubId = dto.ClubId;
        appointment.NationalTeamId = dto.NationalTeamId;
        appointment.StartDate = dto.StartDate;
        appointment.EndDate = dto.EndDate;
        appointment.SourceUrl = dto.SourceUrl;
        appointment.UpdatedAt = DateTime.UtcNow;
        _repository.Update(appointment);

        // One SaveChanges for both rows: the pair succeeds or fails together.
        await _repository.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var appointment = await _repository.GetByIdAsync(id);
        if (appointment is null) return false;

        _repository.Delete(appointment);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Every appointment as a CSV or JSON download, grouped under
    /// the team by name, newest known dates first. Columns match the JSON
    /// property names; blank cells mean null. Dates are ISO 8601 and
    /// timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllForExportAsync())
            .OrderBy(a => a.Club?.Name ?? a.NationalTeam?.Name ?? "")
            .ThenBy(a => a.StartDate == null)
            .ThenByDescending(a => a.StartDate)
            .ThenByDescending(a => a.StaffAppointmentId)
            .Select(a => new StaffAppointmentRow(
                a.StaffAppointmentId,
                a.StaffMemberId,
                a.StaffMember?.KnownAs ?? a.StaffMember?.FullName,
                a.Role,
                a.ClubId,
                a.Club?.Name,
                a.NationalTeamId,
                a.NationalTeam?.Name,
                a.StartDate?.ToString("yyyy-MM-dd"),
                a.EndDate?.ToString("yyyy-MM-dd"),
                a.SourceUrl,
                a.CreatedAt,
                a.UpdatedAt))
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("staffAppointmentId,staffMemberId,staffMemberName,role,clubId,clubName,nationalTeamId,nationalTeamName,startDate,endDate,sourceUrl,createdAt,updatedAt");
            foreach (var r in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.StaffAppointmentId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.StaffMemberId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.StaffMemberName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Role);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ClubId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ClubName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.NationalTeamId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.NationalTeamName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.StartDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.EndDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "staff-appointments.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "staff-appointments.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    /// <summary>The team choice rules: the appointment needs exactly one team.
    /// An unattached member (neither FK set) is checked too.</summary>
    private async Task ValidateTeamChoiceAsync(
        int? staffMemberId, int? clubId, int? nationalTeamId, List<string> errors,
        bool requireStaffMember = true)
    {
        if (requireStaffMember)
        {
            if (staffMemberId is null)
            {
                errors.Add("Staff member is required.");
                return;
            }

            if (!await _repository.StaffMemberExistsAsync(staffMemberId.Value))
                errors.Add($"There is no staff member with id {staffMemberId.Value}.");
        }

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

    /// <summary>Validates the person fields supplied alongside a combined
    /// appointment write, returning the normalized values only when they pass.</summary>
    private async Task<(string FullName, string Nationality)?> ValidateMemberFieldsAsync(
        string? fullName, string? nationality, int? playerId, List<string> errors)
    {
        var before = errors.Count;
        var name = fullName?.Trim() ?? string.Empty;
        if (name.Length == 0)
            errors.Add("Full name is required.");

        if (playerId is { } id && !await _staffMemberRepository.PlayerExistsAsync(id))
            errors.Add($"There is no player with id {id}.");

        if (errors.Count > before) return null;

        return (
            name,
            string.IsNullOrWhiteSpace(nationality) ? "Malawi" : nationality.Trim());
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
