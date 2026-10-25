using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamService : INationalTeamService
{
    private readonly INationalTeamRepository _repository;

    public NationalTeamService(INationalTeamRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NationalTeam>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<NationalTeam>> GetPageAsync(NationalTeamQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<NationalTeam>
        {
            Items = [.. items],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<NationalTeamFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (countries, genders, levels) = await _repository.GetFilterOptionsAsync();
        return new NationalTeamFilterOptionsDto
        {
            Countries = [.. countries],
            Genders = [.. genders],
            Levels = [.. levels]
        };
    }

    public async Task<NationalTeam?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<NationalTeam?> CreateAsync(CreateNationalTeamDto dto)
    {
        var name = dto.Name.Trim();
        if (name.Length == 0 || await _repository.NameExistsAsync(name))
            return null;

        var nationalTeam = new NationalTeam
        {
            Name = name,
            ShortName = dto.ShortName,
            Nickname = dto.Nickname,
            Gender = dto.Gender,
            Level = dto.Level,
            Coach = dto.Coach,
            Country = dto.Country,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(nationalTeam);
        await _repository.SaveChangesAsync();
        return nationalTeam;
    }

    public async Task<NationalTeam?> UpdateAsync(int id, UpdateNationalTeamDto dto)
    {
        var nationalTeam = await _repository.GetByIdAsync(id);
        if (nationalTeam is null) return null;

        var name = dto.Name.Trim();
        if (name.Length == 0 || await _repository.NameExistsAsync(name, id))
            return null;

        nationalTeam.Name = name;
        nationalTeam.ShortName = dto.ShortName;
        nationalTeam.Nickname = dto.Nickname;
        nationalTeam.Gender = dto.Gender;
        nationalTeam.Level = dto.Level;
        nationalTeam.Coach = dto.Coach;
        nationalTeam.Country = dto.Country;
        nationalTeam.SourceUrl = dto.SourceUrl;
        nationalTeam.UpdatedAt = DateTime.UtcNow;

        _repository.Update(nationalTeam);
        await _repository.SaveChangesAsync();
        return nationalTeam;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var nationalTeam = await _repository.GetByIdAsync(id);
        if (nationalTeam is null) return false;

        _repository.Delete(nationalTeam);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Full national team list as a CSV or JSON download. Columns match
    /// the JSON property names; blank cells mean null. Timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllAsync())
            .OrderBy(t => t.Name)
            .ThenBy(t => t.NationalTeamId)
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("nationalTeamId,name,shortName,nickname,gender,level,coach,country,sourceUrl,createdAt,updatedAt");
            foreach (var t in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, t.NationalTeamId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Name);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.ShortName);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Nickname);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Gender);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Level);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Coach);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.Country);
                csv.Append(',');
                Csv.AppendEscaped(csv, t.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(t.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(t.UpdatedAt));
            }

            return new ExportFile(
                "national-teams.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "national-teams.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }
}
