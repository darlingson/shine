using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamMatchService : INationalTeamMatchService
{
    private readonly INationalTeamMatchRepository _repository;
    private readonly INationalTeamRepository _nationalTeamRepository;
    private readonly ICompetitionRepository _competitionRepository;

    public NationalTeamMatchService(
        INationalTeamMatchRepository repository,
        INationalTeamRepository nationalTeamRepository,
        ICompetitionRepository competitionRepository)
    {
        _repository = repository;
        _nationalTeamRepository = nationalTeamRepository;
        _competitionRepository = competitionRepository;
    }

    public async Task<IEnumerable<NationalTeamMatchDto>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToDto);

    public async Task<PagedResult<NationalTeamMatchDto>> GetPageAsync(NationalTeamMatchQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<NationalTeamMatchDto>
        {
            Items = [.. items.Select(ToDto)],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<NationalTeamMatchFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (competitions, seasons) = await _repository.GetFilterOptionsAsync();
        return new NationalTeamMatchFilterOptionsDto
        {
            Competitions = [.. competitions],
            Seasons = [.. seasons]
        };
    }

    public async Task<NationalTeamMatchDto?> GetByIdAsync(int id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match is null ? null : ToDto(match);
    }

    public async Task<NationalTeamMatchDto?> CreateAsync(CreateNationalTeamMatchDto dto, List<string> errors)
    {
        if (!await TeamsExistAsync(dto.HomeNationalTeamId, dto.AwayNationalTeamId, errors))
            return null;
        if (!ShootoutIsValid(dto.HomePenaltyScore, dto.AwayPenaltyScore, errors))
            return null;
        if (!await CompetitionLinksValidAsync(dto.CompetitionId, dto.SeasonId, errors))
            return null;

        var match = new NationalTeamMatch
        {
            MatchDate = dto.MatchDate!.Value,
            KickoffTime = dto.KickoffTime,
            Competition = dto.Competition,
            Season = dto.Season,
            Stage = dto.Stage,
            CompetitionId = dto.CompetitionId,
            SeasonId = dto.SeasonId,
            HomeNationalTeamId = dto.HomeNationalTeamId,
            AwayNationalTeamId = dto.AwayNationalTeamId,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            Venue = dto.Venue,
            IsNeutral = dto.IsNeutral,
            WentToExtraTime = dto.WentToExtraTime,
            HomePenaltyScore = dto.HomePenaltyScore,
            AwayPenaltyScore = dto.AwayPenaltyScore,
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
        if (!ShootoutIsValid(dto.HomePenaltyScore, dto.AwayPenaltyScore, errors))
            return null;
        if (!await CompetitionLinksValidAsync(dto.CompetitionId, dto.SeasonId, errors))
            return null;

        match.MatchDate = dto.MatchDate!.Value;
        match.KickoffTime = dto.KickoffTime;
        match.Competition = dto.Competition;
        match.Season = dto.Season;
        match.Stage = dto.Stage;
        match.CompetitionId = dto.CompetitionId;
        match.SeasonId = dto.SeasonId;
        match.HomeNationalTeamId = dto.HomeNationalTeamId;
        match.AwayNationalTeamId = dto.AwayNationalTeamId;
        match.HomeScore = dto.HomeScore;
        match.AwayScore = dto.AwayScore;
        match.Venue = dto.Venue;
        match.IsNeutral = dto.IsNeutral;
        match.WentToExtraTime = dto.WentToExtraTime;
        match.HomePenaltyScore = dto.HomePenaltyScore;
        match.AwayPenaltyScore = dto.AwayPenaltyScore;
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

    public async Task<NationalTeamMatchDto?> LinkCompetitionAsync(int id, LinkNationalTeamMatchCompetitionDto dto, List<string> errors)
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

    private static bool ShootoutIsValid(int? home, int? away, List<string> errors)
    {
        if (home is null && away is null) return true;
        if (home is null || away is null)
        {
            errors.Add("Set both penalty scores, or neither.");
            return false;
        }
        if (home < 0 || away < 0)
        {
            errors.Add("Penalty scores cannot be negative.");
            return false;
        }
        return true;
    }

    // CSV header — the camelCase NationalTeamMatchRow property names in order,
    // so the CSV names each column exactly as the JSON serialized from that
    // record does.
    private static readonly string CsvHeader =
        "matchId,matchDate,kickoffTime,competition,season,stage,homeNationalTeamId,homeNationalTeamName,awayNationalTeamId,awayNationalTeamName,homeScore,awayScore,venue,isNeutral,wentToExtraTime,homePenaltyScore,awayPenaltyScore,sourceUrl,createdAt,updatedAt";

    /// <summary>Full national team match list as a CSV or JSON download. Both
    /// formats use the NationalTeamMatchRow columns with team names resolved;
    /// blank cells mean null. Dates and times are ISO 8601 and timestamps are
    /// UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var matchRows = (await _repository.GetAllAsync())
            .OrderByDescending(m => m.MatchDate)
            .ThenByDescending(m => m.MatchId)
            .Select(m => new NationalTeamMatchRow(
                m.MatchId,
                m.MatchDate.ToString("yyyy-MM-dd"),
                m.KickoffTime?.ToString("HH:mm"),
                m.Competition,
                m.Season,
                m.Stage,
                m.HomeNationalTeamId,
                m.HomeNationalTeam?.Name,
                m.AwayNationalTeamId,
                m.AwayNationalTeam?.Name,
                m.HomeScore,
                m.AwayScore,
                m.Venue,
                m.IsNeutral,
                m.WentToExtraTime,
                m.HomePenaltyScore,
                m.AwayPenaltyScore,
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
                Csv.AppendEscaped(csv, r.KickoffTime);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Competition);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Season);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Stage);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeNationalTeamId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeNationalTeamName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayNationalTeamId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayNationalTeamName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Venue);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.IsNeutral ? "true" : "false");
                csv.Append(',');
                Csv.AppendEscaped(csv, r.WentToExtraTime ? "true" : "false");
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomePenaltyScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayPenaltyScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "national-team-matches.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(matchRows, ExportFormats.JsonOptions);
        return new ExportFile(
            "national-team-matches.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    private async Task<bool> TeamsExistAsync(int? homeId, int? awayId, List<string> errors)
    {
        var before = errors.Count;
        if (homeId is not null && homeId == awayId)
            errors.Add("A match cannot have the same team on both sides.");
        if (homeId is int home && !await _nationalTeamRepository.ExistsAsync(home))
            errors.Add($"Unknown homeNationalTeamId {home}.");
        if (awayId is int away && !await _nationalTeamRepository.ExistsAsync(away))
            errors.Add($"Unknown awayNationalTeamId {away}.");
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

    private static NationalTeamMatchDto ToDto(NationalTeamMatch m) => new()
    {
        MatchId = m.MatchId,
        MatchDate = m.MatchDate,
        KickoffTime = m.KickoffTime,
        Competition = m.Competition,
        Season = m.Season,
        Stage = m.Stage,
        CompetitionId = m.CompetitionId,
        SeasonId = m.SeasonId,
        CompetitionName = m.CompetitionRef?.Name,
        SeasonName = m.SeasonRef is null ? null : (m.SeasonRef.Name ?? m.SeasonRef.Label),
        HomeNationalTeamId = m.HomeNationalTeamId,
        AwayNationalTeamId = m.AwayNationalTeamId,
        HomeNationalTeamName = m.HomeNationalTeam?.Name,
        AwayNationalTeamName = m.AwayNationalTeam?.Name,
        HomeScore = m.HomeScore,
        AwayScore = m.AwayScore,
        Venue = m.Venue,
        IsNeutral = m.IsNeutral,
        WentToExtraTime = m.WentToExtraTime,
        HomePenaltyScore = m.HomePenaltyScore,
        AwayPenaltyScore = m.AwayPenaltyScore,
        SourceUrl = m.SourceUrl,
    };
}
