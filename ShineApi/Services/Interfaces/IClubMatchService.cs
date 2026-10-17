using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface IClubMatchService
{
    Task<IEnumerable<ClubMatchDto>> GetAllAsync();
    Task<ClubMatchDto?> GetByIdAsync(int id);
    Task<ClubMatchDto> CreateAsync(CreateClubMatchDto dto);
    Task<ClubMatchDto?> UpdateAsync(int id, UpdateClubMatchDto dto);
    Task<ClubMatchDto?> LinkTeamsAsync(int id, LinkClubMatchTeamsDto dto);
    Task<bool> DeleteAsync(int id);
}
