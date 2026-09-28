using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface IClubRepository
{
    Task<IEnumerable<Club>> GetAllAsync();
    Task<Club?> GetByIdAsync(int id);
    Task<Club> AddAsync(Club club);
    void Update(Club club);
    void Delete(Club club);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
