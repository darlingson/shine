using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IMatchService
{
    Task<IEnumerable<Match>> GetAllAsync();
    Task<Match?> GetByIdAsync(int id);
    Task<Match> CreateAsync(CreateMatchDto dto);
    Task<Match?> UpdateAsync(int id, UpdateMatchDto dto);
    Task<bool> DeleteAsync(int id);
}
