using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class ClubMatchService : IClubMatchService
{
    private readonly IClubMatchRepository _repository;
    private readonly IClubRepository _clubRepository;
    private readonly ICompetitionRepository _competitionRepository;

    public ClubMatchService(
        IClubMatchRepository repository,
        IClubRepository clubRepository,
        ICompetitionRepository competitionRepository)
    {
        _repository = repository;
        _clubRepository = clubRepository;
        _competitionRepository = competitionRepository;
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
        if (!await CompetitionLinksValidAsync(dto.CompetitionId, dto.SeasonId, errors))
            return null;

        var match = new ClubMatch
        {
            MatchDate = dto.MatchDate!.Value,
            Competition = dto.Competition,
            Season = dto.Season,
            CompetitionId = dto.CompetitionId,
            SeasonId = dto.SeasonId,
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
        if (!await CompetitionLinksValidAsync(dto.CompetitionId, dto.SeasonId, errors))
            return null;

        match.MatchDate = dto.MatchDate!.Value;
        match.Competition = dto.Competition;
        match.Season = dto.Season;
        match.CompetitionId = dto.CompetitionId;
        match.SeasonId = dto.SeasonId;
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

    public async Task<ClubMatchDto?> LinkCompetitionAsync(int id, LinkClubMatchCompetitionDto dto, List<string> errors)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match is null) return null;

        if (!await CompetitionLinksValidAsync(dto.CompetitionId, dto.SeasonId, errors))
            return null;

        match.CompetitionId = dto.CompetitionId;
        match.SeasonId = dto.SeasonId;
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

    // CSV header — the camelCase ClubMatchRow property names in order, so the
    // CSV names each column exactly as the JSON serialized from that record
    // does.
    private static readonly string CsvHeader =
        "matchId,matchDate,competition,season,homeClubId,homeClubName,awayClubId,awayClubName,homeScore,awayScore,venue,sourceUrl,createdAt,updatedAt";

    /// <summary>Full club match list as a CSV or JSON download. Columns match the
    /// JSON property names with club names resolved; blank cells mean null. Dates
    /// are ISO 8601 and timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var matchRows = (await _repository.GetAllAsync())
            .OrderByDescending(m => m.MatchDate)
            .ThenByDescending(m => m.MatchId)
            .Select(m => new ClubMatchRow(
                m.MatchId,
                m.MatchDate.ToString("yyyy-MM-dd"),
                m.Competition,
                m.Season,
                m.HomeClubId,
                m.HomeClub?.Name,
                m.AwayClubId,
                m.AwayClub?.Name,
                m.HomeScore,
                m.AwayScore,
                m.Venue,
                m.SourceUrl,
                m.CreatedAt,
                m.UpdatedAt))
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append(CsvHeader);
            foreach (var r in matchRows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.MatchId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.MatchDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Competition);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Season);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeClubId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeClubName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayClubId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayClubName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Venue);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "club-matches.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(matchRows, ExportFormats.JsonOptions);
        return new ExportFile(
            "club-matches.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
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

    /// <summary>Validates competition/season link input on match writes: an
    /// unknown competition, an unknown season, a season from another
    /// competition, or a season without its competition are all errors.</summary>
    private async Task<bool> CompetitionLinksValidAsync(int? competitionId, int? seasonId, List<string> errors)
    {
        var before = errors.Count;
        if (competitionId is not null && seasonId is not null)
        {
            if (competitionId <= 0 || !await _competitionRepository.ExistsAsync(competitionId.Value))
                errors.Add($"Unknown competitionId {competitionId}.");

            var season = seasonId > 0 ? await _competitionRepository.GetSeasonByIdAsync(seasonId.Value) : null;
            if (season is null)
                errors.Add($"Unknown seasonId {seasonId}.");
            else if (competitionId > 0 && season.CompetitionId != competitionId)
                errors.Add($"Season {seasonId} belongs to competition {season.CompetitionId}, not competition {competitionId}.");
        }
        else if (competitionId is not null)
        {
            if (competitionId <= 0 || !await _competitionRepository.ExistsAsync(competitionId.Value))
                errors.Add($"Unknown competitionId {competitionId}.");
        }
        else if (seasonId is not null)
        {
            errors.Add("A seasonId cannot be set without its competitionId.");
        }
        return errors.Count == before;
    }

    private static ClubMatchDto ToDto(ClubMatch m) => new()
    {
        MatchId = m.MatchId,
        MatchDate = m.MatchDate,
        Competition = m.Competition,
        Season = m.Season,
        CompetitionId = m.CompetitionId,
        SeasonId = m.SeasonId,
        CompetitionName = m.CompetitionRef?.Name,
        SeasonName = m.SeasonRef is null ? null : (m.SeasonRef.Name ?? m.SeasonRef.Label),
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
