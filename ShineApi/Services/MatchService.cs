using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class MatchService : IMatchService
{
    private readonly IMatchRepository _repository;

    public MatchService(IMatchRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Match>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<Match?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<Match> CreateAsync(CreateMatchDto dto)
    {
        var match = new Match
        {
            MatchDate = dto.MatchDate,
            Competition = dto.Competition,
            Season = dto.Season,
            HomeTeam = dto.HomeTeam,
            AwayTeam = dto.AwayTeam,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            Venue = dto.Venue,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(match);
        await _repository.SaveChangesAsync();
        return match;
    }

    public async Task<Match?> UpdateAsync(int id, UpdateMatchDto dto)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        match.MatchDate = dto.MatchDate;
        match.Competition = dto.Competition;
        match.Season = dto.Season;
        match.HomeTeam = dto.HomeTeam;
        match.AwayTeam = dto.AwayTeam;
        match.HomeScore = dto.HomeScore;
        match.AwayScore = dto.AwayScore;
        match.Venue = dto.Venue;
        match.SourceUrl = dto.SourceUrl;
        match.UpdatedAt = DateTime.UtcNow;

        _repository.Update(match);
        await _repository.SaveChangesAsync();
        return match;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return false;

        _repository.Delete(match);
        await _repository.SaveChangesAsync();
        return true;
    }
}
