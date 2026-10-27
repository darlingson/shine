using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class PlayerClubService : IPlayerClubService
{
    private readonly IPlayerClubRepository _repository;

    public PlayerClubService(IPlayerClubRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PlayerClub>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<PlayerClub?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    public async Task<PlayerClub?> CreateAsync(CreatePlayerClubDto dto, List<string> errors)
    {
        var position = Positions.NormalizeOrError(dto.PositionAtClub, "positionAtClub", errors);
        if (errors.Count > 0) return null;

        var playerClub = new PlayerClub
        {
            PlayerId = dto.PlayerId,
            ClubId = dto.ClubId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsCurrent = dto.IsCurrent,
            ContractType = dto.ContractType,
            ShirtNumber = dto.ShirtNumber,
            PositionAtClub = position?.Position,
            RoleAtClub = position?.Role,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(playerClub);
        await _repository.SaveChangesAsync();
        return playerClub;
    }

    public async Task<PlayerClub?> UpdateAsync(int id, UpdatePlayerClubDto dto, List<string> errors)
    {
        var playerClub = await _repository.GetByIdAsync(id);
        if (playerClub is null) return null;

        var position = Positions.NormalizeOrError(dto.PositionAtClub, "positionAtClub", errors);
        if (errors.Count > 0) return playerClub;

        playerClub.PlayerId = dto.PlayerId;
        playerClub.ClubId = dto.ClubId;
        playerClub.StartDate = dto.StartDate;
        playerClub.EndDate = dto.EndDate;
        playerClub.IsCurrent = dto.IsCurrent;
        playerClub.ContractType = dto.ContractType;
        playerClub.ShirtNumber = dto.ShirtNumber;
        playerClub.PositionAtClub = position?.Position;
        playerClub.RoleAtClub = position?.Role;
        playerClub.SourceUrl = dto.SourceUrl;
        playerClub.UpdatedAt = DateTime.UtcNow;

        _repository.Update(playerClub);
        await _repository.SaveChangesAsync();
        return playerClub;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var playerClub = await _repository.GetByIdAsync(id);
        if (playerClub is null) return false;

        _repository.Delete(playerClub);
        await _repository.SaveChangesAsync();
        return true;
    }

    // CSV header — the camelCase PlayerCareerStintRow property names in order,
    // so the CSV names each column exactly as the JSON serialized from that
    // record does.
    private static readonly string CsvHeader =
        "stintId,playerId,playerName,clubId,clubName,startDate,endDate,isCurrent,contractType,shirtNumber,positionAtClub,roleAtClub,sourceUrl,createdAt,updatedAt";

    /// <summary>Full career history as a CSV or JSON download. One row per club
    /// stint with player and club names resolved; blank cells mean null. Dates
    /// are ISO 8601 and timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var stints = (await _repository.GetAllForExportAsync())
            .OrderBy(pc => pc.Player?.FullName)
            .ThenBy(pc => pc.StartDate?.ToString("yyyy-MM-dd") ?? string.Empty)
            .ThenBy(pc => pc.PlayerClubId)
            .Select(pc => new PlayerCareerStintRow(
                pc.PlayerClubId,
                pc.PlayerId,
                pc.Player?.FullName,
                pc.ClubId,
                pc.Club?.Name,
                pc.StartDate?.ToString("yyyy-MM-dd"),
                pc.EndDate?.ToString("yyyy-MM-dd"),
                pc.IsCurrent,
                pc.ContractType,
                pc.ShirtNumber,
                pc.PositionAtClub,
                pc.RoleAtClub,
                pc.SourceUrl,
                pc.CreatedAt,
                pc.UpdatedAt))
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append(CsvHeader);
            foreach (var r in stints)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.StintId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.PlayerId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.PlayerName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ClubId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ClubName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.StartDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.EndDate);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.IsCurrent ? "true" : "false");
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ContractType);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ShirtNumber?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.PositionAtClub);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.RoleAtClub);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(r.UpdatedAt));
            }

            return new ExportFile(
                "player-career-history.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(stints, ExportFormats.JsonOptions);
        return new ExportFile(
            "player-career-history.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }
}
