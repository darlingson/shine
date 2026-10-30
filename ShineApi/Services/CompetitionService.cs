using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class CompetitionService : ICompetitionService
{
    private readonly ICompetitionRepository _repository;

    public CompetitionService(ICompetitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Competition>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<Competition>> GetPageAsync(CompetitionQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<Competition>
        {
            Items = [.. items],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<CompetitionFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (kinds, tiers, scopes, regions) = await _repository.GetFilterOptionsAsync();
        return new CompetitionFilterOptionsDto
        {
            Kinds = [.. kinds],
            Tiers = [.. tiers],
            Scopes = [.. scopes],
            Regions = [.. regions]
        };
    }

    public async Task<Competition?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<Competition?> CreateAsync(CreateCompetitionDto dto, List<string> errors)
    {
        var name = dto.Name?.Trim() ?? string.Empty;
        if (name.Length == 0)
            errors.Add("Name is required.");

        var kind = Competitions.NormalizeKindOrError(dto.Kind, errors);
        var scope = Competitions.NormalizeScopeOrError(dto.Scope, errors);
        var region = Competitions.NormalizeRegionOrError(dto.Region, errors);
        Competitions.ValidateClassificationOrError(kind, dto.Tier, scope, region, errors);

        // Rejected before persisting — a validation failure must not write a row.
        if (errors.Count > 0) return null;

        if (await _repository.NameExistsAsync(name))
            return null;

        var competition = new Competition
        {
            Name = name,
            ShortName = dto.ShortName,
            Kind = kind!,
            Tier = dto.Tier,
            Scope = scope,
            Region = region,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(competition);
        await _repository.SaveChangesAsync();
        return competition;
    }

    public async Task<Competition?> UpdateAsync(int id, UpdateCompetitionDto dto, List<string> errors)
    {
        var competition = await _repository.GetByIdAsync(id);
        if (competition is null) return null;

        var name = dto.Name?.Trim() ?? string.Empty;
        if (name.Length == 0)
            errors.Add("Name is required.");

        var kind = Competitions.NormalizeKindOrError(dto.Kind, errors);
        var scope = Competitions.NormalizeScopeOrError(dto.Scope, errors);
        var region = Competitions.NormalizeRegionOrError(dto.Region, errors);
        Competitions.ValidateClassificationOrError(kind, dto.Tier, scope, region, errors);

        if (errors.Count > 0)
        {
            // Rejected before persisting — leave the loaded entity untouched.
            return competition;
        }

        if (await _repository.NameExistsAsync(name, id))
            return null;

        competition.Name = name;
        competition.ShortName = dto.ShortName;
        competition.Kind = kind!;
        competition.Tier = dto.Tier;
        competition.Scope = scope;
        competition.Region = region;
        competition.SourceUrl = dto.SourceUrl;
        competition.UpdatedAt = DateTime.UtcNow;

        _repository.Update(competition);
        await _repository.SaveChangesAsync();
        return competition;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var competition = await _repository.GetByIdAsync(id);
        if (competition is null) return false;

        _repository.Delete(competition);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Full competition list as a CSV or JSON download. Columns match
    /// the JSON property names; blank cells mean null. Timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllAsync())
            .OrderBy(c => c.Name)
            .ThenBy(c => c.CompetitionId)
            .Select(c => new CompetitionRow(
                c.CompetitionId,
                c.Name,
                c.ShortName,
                c.Kind,
                c.Tier,
                c.Scope,
                c.Region,
                c.SourceUrl,
                c.CreatedAt,
                c.UpdatedAt))
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("competitionId,name,shortName,kind,tier,scope,region,sourceUrl,createdAt,updatedAt");
            foreach (var r in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.CompetitionId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Name);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ShortName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Kind);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Tier?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Scope);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Region);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "competitions.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "competitions.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    // ── Seasons ─────────────────────────────────────────────────────────

    public async Task<IEnumerable<CompetitionSeason>> GetSeasonsAsync(int competitionId)
        => await _repository.GetSeasonsAsync(competitionId);

    public async Task<CompetitionSeason?> GetSeasonAsync(int competitionId, int seasonId)
        => await _repository.GetSeasonAsync(competitionId, seasonId);

    public async Task<CompetitionSeason?> CreateSeasonAsync(
        int competitionId, CreateCompetitionSeasonDto dto, List<string> errors)
    {
        var label = TrimOrNull(dto.Label);
        var name = TrimOrNull(dto.Name);
        if (label is null && name is null)
            errors.Add("A season needs at least a label (e.g. \"2026\") or a name.");

        if (dto.StartDate is not null && dto.EndDate is not null && dto.EndDate < dto.StartDate)
            errors.Add("A season cannot end before it starts.");

        // Rejected before persisting — a validation failure must not write a row.
        if (errors.Count > 0) return null;

        if (label is not null && await _repository.SeasonLabelInUseAsync(competitionId, label))
            return null;

        var season = new CompetitionSeason
        {
            CompetitionId = competitionId,
            Label = label,
            Name = name,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddSeasonAsync(season);
        await _repository.SaveChangesAsync();
        return season;
    }

    public async Task<CompetitionSeason?> UpdateSeasonAsync(
        int competitionId, int seasonId, UpdateCompetitionSeasonDto dto, List<string> errors)
    {
        var season = await _repository.GetSeasonAsync(competitionId, seasonId);
        if (season is null) return null;

        var label = TrimOrNull(dto.Label);
        var name = TrimOrNull(dto.Name);
        if (label is null && name is null)
            errors.Add("A season needs at least a label (e.g. \"2026\") or a name.");

        if (dto.StartDate is not null && dto.EndDate is not null && dto.EndDate < dto.StartDate)
            errors.Add("A season cannot end before it starts.");

        if (errors.Count > 0)
        {
            // Rejected before persisting — leave the loaded season untouched.
            return season;
        }

        if (label is not null &&
            await _repository.SeasonLabelInUseAsync(competitionId, label, seasonId))
            return null;

        season.Label = label;
        season.Name = name;
        season.StartDate = dto.StartDate;
        season.EndDate = dto.EndDate;
        season.SourceUrl = dto.SourceUrl;
        season.UpdatedAt = DateTime.UtcNow;

        _repository.UpdateSeason(season);
        await _repository.SaveChangesAsync();
        return season;
    }

    public async Task<bool> DeleteSeasonAsync(int competitionId, int seasonId)
    {
        var season = await _repository.GetSeasonAsync(competitionId, seasonId);
        if (season is null) return false;

        _repository.DeleteSeason(season);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Every edition of every competition as a CSV or JSON download.
    /// The competition is resolved beside each row; blank cells mean null.
    /// Dates are ISO 8601 and timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportSeasonsAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllSeasonsAsync())
            .Select(s => new CompetitionSeasonRow(
                s.SeasonId,
                s.CompetitionId,
                s.Competition?.Name,
                s.Label,
                s.Name,
                s.StartDate?.ToString("yyyy-MM-dd"),
                s.EndDate?.ToString("yyyy-MM-dd"),
                s.SourceUrl,
                s.CreatedAt,
                s.UpdatedAt))
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("seasonId,competitionId,competitionName,label,name,startDate,endDate,sourceUrl,createdAt,updatedAt");
            foreach (var r in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.SeasonId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.CompetitionId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.CompetitionName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Label);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Name);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.StartDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.EndDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "competition-seasons.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "competition-seasons.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    private static string? TrimOrNull(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
