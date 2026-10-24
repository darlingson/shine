using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class ClubService : IClubService
{
    private readonly IClubRepository _repository;

    public ClubService(IClubRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Club>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<Club>> GetPageAsync(ClubQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<Club>
        {
            Items = [.. items],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ClubFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (cities, countries) = await _repository.GetFilterOptionsAsync();
        return new ClubFilterOptionsDto
        {
            Cities = [.. cities],
            Countries = [.. countries]
        };
    }

    public async Task<Club?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<Club> CreateAsync(CreateClubDto dto)
    {
        var club = new Club
        {
            Name = dto.Name,
            ShortName = dto.ShortName,
            City = dto.City,
            Country = dto.Country,
            FoundedYear = dto.FoundedYear,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(club);
        await _repository.SaveChangesAsync();
        return club;
    }

    public async Task<Club?> UpdateAsync(int id, UpdateClubDto dto)
    {
        var club = await _repository.GetByIdAsync(id);
        if (club is null) return null;

        club.Name = dto.Name;
        club.ShortName = dto.ShortName;
        club.City = dto.City;
        club.Country = dto.Country;
        club.FoundedYear = dto.FoundedYear;
        club.SourceUrl = dto.SourceUrl;
        club.UpdatedAt = DateTime.UtcNow;

        _repository.Update(club);
        await _repository.SaveChangesAsync();
        return club;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var club = await _repository.GetByIdAsync(id);
        if (club is null) return false;

        _repository.Delete(club);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Full club list as a CSV or JSON download. Columns match the JSON
    /// property names; blank cells mean null. Timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllAsync())
            .OrderBy(c => c.Name)
            .ThenBy(c => c.ClubId)
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("clubId,name,shortName,city,country,foundedYear,sourceUrl,createdAt,updatedAt");
            foreach (var c in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, c.ClubId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, c.Name);
                csv.Append(',');
                Csv.AppendEscaped(csv, c.ShortName);
                csv.Append(',');
                Csv.AppendEscaped(csv, c.City);
                csv.Append(',');
                Csv.AppendEscaped(csv, c.Country);
                csv.Append(',');
                Csv.AppendEscaped(csv, c.FoundedYear?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, c.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(c.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(c.UpdatedAt));
            }

            return new ExportFile(
                "clubs.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "clubs.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }
}
