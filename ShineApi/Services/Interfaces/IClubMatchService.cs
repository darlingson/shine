using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface IClubMatchService
{
    Task<IEnumerable<ClubMatchDto>> GetAllAsync();
    Task<PagedResult<ClubMatchDto>> GetPageAsync(ClubMatchQuery query);
    Task<ClubMatchFilterOptionsDto> GetFilterOptionsAsync();
    Task<ClubMatchDto?> GetByIdAsync(int id);
    Task<ClubMatchDto?> CreateAsync(CreateClubMatchDto dto, List<string> errors);
    Task<ClubMatchDto?> UpdateAsync(int id, UpdateClubMatchDto dto, List<string> errors);
    Task<ClubMatchDto?> LinkTeamsAsync(int id, LinkClubMatchTeamsDto dto, List<string> errors);
    Task<bool> DeleteAsync(int id);
}
