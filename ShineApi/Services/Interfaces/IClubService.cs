using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IClubService
{
    Task<IEnumerable<Club>> GetAllAsync();
    Task<Club?> GetByIdAsync(int id);
    Task<Club> CreateAsync(CreateClubDto dto);
    Task<Club?> UpdateAsync(int id, UpdateClubDto dto);
    Task<bool> DeleteAsync(int id);
}
