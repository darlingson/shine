using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamMatchService : INationalTeamMatchService
{
    private readonly INationalTeamMatchRepository _repository;
    private readonly INationalTeamRepository _nationalTeamRepository;

    public NationalTeamMatchService(
        INationalTeamMatchRepository repository,
        INationalTeamRepository nationalTeamRepository)
    {
        _repository = repository;
        _nationalTeamRepository = nationalTeamRepository;
    }

    public async Task<IEnumerable<NationalTeamMatchDto>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToDto);

    public async Task<NationalTeamMatchDto?> GetByIdAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match is null ? null : ToDto(match);
    }

    public async Task<NationalTeamMatchDto?> CreateAsync(CreateNationalTeamMatchDto dto, List<string> errors)
    {
        if (!await TeamsExistAsync(dto.HomeNationalTeamId, dto.AwayNationalTeamId, errors))
            return null;

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

    public async Task<NationalTeamMatchDto?> UpdateAsync(int id, UpdateNationalTeamMatchDto dto, List<string> errors)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        if (!await TeamsExistAsync(dto.HomeNationalTeamId, dto.AwayNationalTeamId, errors))
            return null;

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

    public async Task<NationalTeamMatchDto?> LinkTeamsAsync(int id, LinkNationalTeamMatchTeamsDto dto, List<string> errors)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        if (!await TeamsExistAsync(dto.HomeNationalTeamId, dto.AwayNationalTeamId, errors))
            return null;

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

    private async Task<bool> TeamsExistAsync(int? homeId, int? awayId, List<string> errors)
    {
        var before = errors.Count;
        if (homeId is int h && !await _nationalTeamRepository.ExistsAsync(h))
            errors.Add($"Unknown homeNationalTeamId {h}.");
        if (awayId is int a && !await _nationalTeamRepository.ExistsAsync(a))
            errors.Add($"Unknown awayNationalTeamId {a}.");
        return errors.Count == before;
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
