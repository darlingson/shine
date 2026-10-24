using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;
using System.Text;
using System.Text.Json;

namespace ShineApi.Services;

public class PlayerService : IPlayerService
{
    private readonly IPlayerRepository _repository;

    public PlayerService(IPlayerRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Player>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PagedResult<Player>> GetPageAsync(PlayerQuery query)
    {
        var (items, total) = await _repository.GetPageAsync(query);
        return new PagedResult<Player>
        {
            Items = [.. items],
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PlayerFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (nationalities, positions) = await _repository.GetFilterOptionsAsync();
        return new PlayerFilterOptionsDto
        {
            Nationalities = [.. nationalities],
            Positions = [.. positions]
        };
    }

    public async Task<Player?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<Player> CreateAsync(CreatePlayerDto dto)
    {
        var player = new Player
        {
            FullName = dto.FullName,
            KnownAs = dto.KnownAs,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Nationality = dto.Nationality,
            PositionPrimary = dto.PositionPrimary,
            PositionSecondary = dto.PositionSecondary,
            HeightCm = dto.HeightCm,
            Foot = dto.Foot,
            Status = dto.Status,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(player);
        await _repository.SaveChangesAsync();
        return player;
    }

    public async Task<Player?> UpdateAsync(int id, UpdatePlayerDto dto)
    {
        var player = await _repository.GetByIdAsync(id);
        if (player is null) return null;

        player.FullName = dto.FullName;
        player.KnownAs = dto.KnownAs;
        player.DateOfBirth = dto.DateOfBirth;
        player.Gender = dto.Gender;
        player.Nationality = dto.Nationality;
        player.PositionPrimary = dto.PositionPrimary;
        player.PositionSecondary = dto.PositionSecondary;
        player.HeightCm = dto.HeightCm;
        player.Foot = dto.Foot;
        player.Status = dto.Status;
        player.SourceUrl = dto.SourceUrl;
        player.UpdatedAt = DateTime.UtcNow;

        _repository.Update(player);
        await _repository.SaveChangesAsync();
        return player;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var player = await _repository.GetByIdAsync(id);
        if (player is null) return false;

        _repository.Delete(player);
        await _repository.SaveChangesAsync();
        return true;
    }

    /// <summary>Full player list as a CSV or JSON download. CSV columns match the
    /// JSON property names; blank cells mean the value is null. Dates are ISO 8601
    /// and timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var players = (await _repository.GetAllAsync())
            .OrderBy(p => p.FullName)
            .ThenBy(p => p.PlayerId)
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var buffer = new StringBuilder();
            buffer.Append("playerId,fullName,knownAs,dateOfBirth,gender,nationality,positionPrimary,positionSecondary,heightCm,foot,status,sourceUrl,createdAt,updatedAt");
            foreach (var p in players)
            {
                buffer.AppendLine();
                Csv.AppendEscaped(buffer, p.PlayerId.ToString());
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.FullName);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.KnownAs);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, IsoDate(p.DateOfBirth));
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.Gender);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.Nationality);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.PositionPrimary);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.PositionSecondary);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.HeightCm?.ToString());
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.Foot);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.Status);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, p.SourceUrl);
                buffer.Append(',');
                Csv.AppendEscaped(buffer, ExportFormats.IsoTimestamp(p.CreatedAt));
                buffer.Append(',');
                Csv.AppendEscaped(buffer, ExportFormats.IsoTimestamp(p.UpdatedAt));
            }

            // UTF-8 BOM so Excel detects the encoding when opened by double-click.
            var content = ExportFormats.WithUtf8Bom(buffer);
            return new ExportFile("players.csv", "text/csv; charset=utf-8", content);
        }

        var json = JsonSerializer.Serialize(
            players,
            ExportFormats.JsonOptions);
        return new ExportFile(
            "players.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    private static string? IsoDate(DateOnly? date)
        => date?.ToString("yyyy-MM-dd");
}
