using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class StaffMemberService : IStaffMemberService
{
    private readonly IStaffMemberRepository _repository;

    public StaffMemberService(IStaffMemberRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<StaffMember>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<StaffMember>> GetPageAsync(StaffMemberQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<StaffMember>
        {
            Items = [.. items],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<StaffMemberFilterOptionsDto> GetFilterOptionsAsync()
    {
        var nationalities = await _repository.GetNationalitiesAsync();
        return new StaffMemberFilterOptionsDto
        {
            Nationalities = [.. nationalities]
        };
    }

    public async Task<StaffMember?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<StaffMember?> CreateAsync(CreateStaffMemberDto dto, List<string> errors)
    {
        var fullName = dto.FullName?.Trim() ?? string.Empty;
        if (fullName.Length == 0)
            errors.Add("Full name is required.");

        if (dto.PlayerId is { } playerId && !await _repository.PlayerExistsAsync(playerId))
            errors.Add($"There is no player with id {playerId}.");

        // Rejected before persisting — a validation failure must not write a row.
        if (errors.Count > 0) return null;

        var staffMember = new StaffMember
        {
            FullName = fullName,
            KnownAs = dto.KnownAs,
            Nationality = string.IsNullOrWhiteSpace(dto.Nationality)
                ? "Malawi"
                : dto.Nationality.Trim(),
            PlayerId = dto.PlayerId,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(staffMember);
        await _repository.SaveChangesAsync();
        return staffMember;
    }

    public async Task<StaffMember?> UpdateAsync(int id, UpdateStaffMemberDto dto, List<string> errors)
    {
        var staffMember = await _repository.GetByIdAsync(id);
        if (staffMember is null) return null;

        var fullName = dto.FullName?.Trim() ?? string.Empty;
        if (fullName.Length == 0)
            errors.Add("Full name is required.");

        if (dto.PlayerId is { } playerId && !await _repository.PlayerExistsAsync(playerId))
            errors.Add($"There is no player with id {playerId}.");

        if (errors.Count > 0)
        {
            // Rejected before persisting — leave the loaded member untouched.
            return staffMember;
        }

        staffMember.FullName = fullName;
        staffMember.KnownAs = dto.KnownAs;
        staffMember.Nationality = string.IsNullOrWhiteSpace(dto.Nationality)
            ? "Malawi"
            : dto.Nationality.Trim();
        staffMember.PlayerId = dto.PlayerId;
        staffMember.SourceUrl = dto.SourceUrl;
        staffMember.UpdatedAt = DateTime.UtcNow;

        _repository.Update(staffMember);
        await _repository.SaveChangesAsync();
        return staffMember;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var staffMember = await _repository.GetByIdAsync(id);
        if (staffMember is null) return false;

        _repository.Delete(staffMember);
        await _repository.SaveChangesAsync();
        return true;
    }
}
