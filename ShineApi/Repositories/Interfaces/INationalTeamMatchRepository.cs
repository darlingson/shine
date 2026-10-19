using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Repositories.Interfaces;

public interface INationalTeamMatchRepository
{
    Task<IEnumerable<NationalTeamMatch>> GetAllAsync();
    Task<(IReadOnlyList<NationalTeamMatch> Items, int Total)> GetPageAsync(NationalTeamMatchQuery query);
    Task<(IReadOnlyList<string> Competitions, IReadOnlyList<string> Seasons)> GetFilterOptionsAsync();
    Task<NationalTeamMatch?> GetByIdAsync(int id);
    Task<NationalTeamMatch> AddAsync(NationalTeamMatch match);
    void Update(NationalTeamMatch match);
    void Delete(NationalTeamMatch match);
    Task<bool> ExistsAsync(int id);
    Task SaveChangesAsync();
}
