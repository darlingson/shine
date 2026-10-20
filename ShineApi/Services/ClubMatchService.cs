using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class ClubMatchService : IClubMatchService
{
    private readonly IClubMatchRepository _repository;
    private readonly IClubRepository _clubRepository;

    public ClubMatchService(IClubMatchRepository repository, IClubRepository clubRepository)
    {
        _repository = repository;
        _clubRepository = clubRepository;
    }

    public async Task<IEnumerable<ClubMatchDto>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToDto);

    public async Task<PagedResult<ClubMatchDto>> GetPageAsync(ClubMatchQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<ClubMatchDto>
        {
            Items = [.. items.Select(ToDto)],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ClubMatchFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (competitions, seasons) = await _repository.GetFilterOptionsAsync();
        return new ClubMatchFilterOptionsDto
        {
            Competitions = [.. competitions],
            Seasons = [.. seasons]
        };
    }

    public async Task<ClubMatchDto?> GetByIdAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match is null ? null : ToDto(match);
    }

    public async Task<ClubMatchDto?> CreateAsync(CreateClubMatchDto dto, List<string> errors)
    {
        if (!await ClubsExistAsync(dto.HomeClubId, dto.AwayClubId, errors))
            return null;

        var match = new ClubMatch
        {
            MatchDate = dto.MatchDate!.Value,
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

    public async Task<ClubMatchDto?> UpdateAsync(int id, UpdateClubMatchDto dto, List<string> errors)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        if (!await ClubsExistAsync(dto.HomeClubId, dto.AwayClubId, errors))
            return null;

        match.MatchDate = dto.MatchDate!.Value;
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

    public async Task<ClubMatchDto?> LinkTeamsAsync(int id, LinkClubMatchTeamsDto dto, List<string> errors)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        if (!await ClubsExistAsync(dto.HomeClubId, dto.AwayClubId, errors))
            return null;

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

    private async Task<bool> ClubsExistAsync(int? homeId, int? awayId, List<string> errors)
    {
        var before = errors.Count;
        if (homeId is not null && homeId == awayId)
            errors.Add("A match cannot have the same club on both sides.");
        if (homeId is int home && !await _clubRepository.ExistsAsync(home))
            errors.Add($"Unknown homeClubId {home}.");
        if (awayId is int away && !await _clubRepository.ExistsAsync(away))
            errors.Add($"Unknown awayClubId {away}.");
        return errors.Count == before;
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
