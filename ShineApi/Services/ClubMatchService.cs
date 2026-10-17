using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class ClubMatchService : IClubMatchService
{
    private readonly IClubMatchRepository _repository;

    public ClubMatchService(IClubMatchRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ClubMatchDto>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToDto);

    public async Task<ClubMatchDto?> GetByIdAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match is null ? null : ToDto(match);
    }

    public async Task<ClubMatchDto> CreateAsync(CreateClubMatchDto dto)
    {
        var match = new ClubMatch
        {
            MatchDate = dto.MatchDate,
            Competition = dto.Competition,
            Season = dto.Season,
            HomeClubId = dto.HomeClubId,
            AwayClubId = dto.AwayClubId,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            Venue = dto.Venue,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _repository.AddAsync(match);
        await _repository.SaveChangesAsync();
        return (await GetByIdAsync(match.MatchId))!;
    }

    public async Task<ClubMatchDto?> UpdateAsync(int id, UpdateClubMatchDto dto)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        match.MatchDate = dto.MatchDate;
        match.Competition = dto.Competition;
        match.Season = dto.Season;
        match.HomeClubId = dto.HomeClubId;
        match.AwayClubId = dto.AwayClubId;
        match.HomeScore = dto.HomeScore;
        match.AwayScore = dto.AwayScore;
        match.Venue = dto.Venue;
        match.SourceUrl = dto.SourceUrl;
        match.UpdatedAt = DateTime.UtcNow;

        _repository.Update(match);
        await _repository.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<ClubMatchDto?> LinkTeamsAsync(int id, LinkClubMatchTeamsDto dto)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        match.HomeClubId = dto.HomeClubId;
        match.AwayClubId = dto.AwayClubId;
        match.UpdatedAt = DateTime.UtcNow;

        _repository.Update(match);
        await _repository.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return false;

        _repository.Delete(match);
        await _repository.SaveChangesAsync();
        return true;
    }

    private static ClubMatchDto ToDto(ClubMatch m) => new()
    {
        MatchId = m.MatchId,
        MatchDate = m.MatchDate,
        Competition = m.Competition,
        Season = m.Season,
        HomeClubId = m.HomeClubId,
        AwayClubId = m.AwayClubId,
        HomeClubName = m.HomeClub?.Name,
        AwayClubName = m.AwayClub?.Name,
        HomeScore = m.HomeScore,
        AwayScore = m.AwayScore,
        Venue = m.Venue,
        SourceUrl = m.SourceUrl,
    };
}
