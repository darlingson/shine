using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IClubRepository
{
    Task<IEnumerable<Club>> GetAllAsync();
    Task<(IReadOnlyList<Club> Items, int Total)> GetPageAsync(ClubQuery query);
    Task<(IReadOnlyList<string> Cities, IReadOnlyList<string> Countries)> GetFilterOptionsAsync();
    Task<Club?> GetByIdAsync(int id);
    Task<Club> AddAsync(Club club);
    void Update(Club club);
    void Delete(Club club);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
