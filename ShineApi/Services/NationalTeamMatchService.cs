using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamMatchService : INationalTeamMatchService
{
    private readonly INationalTeamMatchRepository _repository;

    public NationalTeamMatchService(INationalTeamMatchRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NationalTeamMatchDto>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToDto);

    public async Task<NationalTeamMatchDto?> GetByIdAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match is null ? null : ToDto(match);
    }

    public async Task<NationalTeamMatchDto> CreateAsync(CreateNationalTeamMatchDto dto)
    {
        var match = new NationalTeamMatch
        {
            MatchDate = dto.MatchDate,
            Competition = dto.Competition,
            Season = dto.Season,
            HomeNationalTeamId = dto.HomeNationalTeamId,
            AwayNationalTeamId = dto.AwayNationalTeamId,
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

    public async Task<NationalTeamMatchDto?> UpdateAsync(int id, UpdateNationalTeamMatchDto dto)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        match.MatchDate = dto.MatchDate;
        match.Competition = dto.Competition;
        match.Season = dto.Season;
        match.HomeNationalTeamId = dto.HomeNationalTeamId;
        match.AwayNationalTeamId = dto.AwayNationalTeamId;
        match.HomeScore = dto.HomeScore;
        match.AwayScore = dto.AwayScore;
        match.Venue = dto.Venue;
        match.SourceUrl = dto.SourceUrl;
        match.UpdatedAt = DateTime.UtcNow;

        _repository.Update(match);
        await _repository.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<NationalTeamMatchDto?> LinkTeamsAsync(int id, LinkNationalTeamMatchTeamsDto dto)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        match.HomeNationalTeamId = dto.HomeNationalTeamId;
        match.AwayNationalTeamId = dto.AwayNationalTeamId;
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

    private static NationalTeamMatchDto ToDto(NationalTeamMatch m) => new()
    {
        MatchId = m.MatchId,
        MatchDate = m.MatchDate,
        Competition = m.Competition,
        Season = m.Season,
        HomeNationalTeamId = m.HomeNationalTeamId,
        AwayNationalTeamId = m.AwayNationalTeamId,
        HomeNationalTeamName = m.HomeNationalTeam?.Name,
        AwayNationalTeamName = m.AwayNationalTeam?.Name,
        HomeScore = m.HomeScore,
        AwayScore = m.AwayScore,
        Venue = m.Venue,
        SourceUrl = m.SourceUrl,
    };
}
