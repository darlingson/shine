using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IClubMatchRepository
{
    Task<IEnumerable<ClubMatch>> GetAllAsync();
    Task<(IReadOnlyList<ClubMatch> Items, int Total)> GetPageAsync(ClubMatchQuery query);
    Task<(IReadOnlyList<string> Competitions, IReadOnlyList<string> Seasons)> GetFilterOptionsAsync();
    Task<ClubMatch?> GetByIdAsync(int id);
    Task<ClubMatch> AddAsync(ClubMatch match);
    void Update(ClubMatch match);
    void Delete(ClubMatch match);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
