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

    /// <summary>Full career history as a CSV or JSON download. One row per club
    /// stint with player and club names resolved; blank cells mean null. Dates
    /// are ISO 8601 and timestamps are UTC.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var rows = (await _repository.GetAllForExportAsync())
            .OrderBy(pc => pc.Player?.FullName)
            .ThenBy(pc => pc.StartDate?.ToString("yyyy-MM-dd") ?? string.Empty)
            .ThenBy(pc => pc.PlayerClubId)
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("stintId,playerId,playerName,clubId,clubName,startDate,endDate,isCurrent,contractType,shirtNumber,positionAtClub,roleAtClub,sourceUrl,createdAt,updatedAt");
            foreach (var pc in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, pc.PlayerClubId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.PlayerId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.Player?.FullName);
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.ClubId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.Club?.Name);
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.StartDate?.ToString("yyyy-MM-dd"));
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.EndDate?.ToString("yyyy-MM-dd"));
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.IsCurrent ? "true" : "false");
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.ContractType);
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.ShirtNumber?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.PositionAtClub);
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.RoleAtClub);
                csv.Append(',');
                Csv.AppendEscaped(csv, pc.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(pc.CreatedAt));
                csv.Append(',');
                Csv.AppendEscaped(csv, ExportFormats.IsoTimestamp(pc.UpdatedAt));
            }

            return new ExportFile(
                "player-career-history.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "player-career-history.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }
}
