using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IClubMatchRepository
{
    Task<IEnumerable<ClubMatch>> GetAllAsync();
    Task<ClubMatch?> GetByIdAsync(int id);
    Task<ClubMatch> AddAsync(ClubMatch match);
    void Update(ClubMatch match);
    void Delete(ClubMatch match);
    Task SaveChangesAsync();
}
