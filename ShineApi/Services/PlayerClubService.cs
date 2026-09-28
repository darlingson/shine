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

    public async Task<PlayerClub> CreateAsync(CreatePlayerClubDto dto)
    {
        var playerClub = new PlayerClub
        {
            PlayerId = dto.PlayerId,
            ClubId = dto.ClubId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsCurrent = dto.IsCurrent,
            ContractType = dto.ContractType,
            ShirtNumber = dto.ShirtNumber,
            PositionAtClub = dto.PositionAtClub,
            SourceUrl = dto.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(playerClub);
        await _repository.SaveChangesAsync();
        return playerClub;
    }

    public async Task<PlayerClub?> UpdateAsync(int id, UpdatePlayerClubDto dto)
    {
        var playerClub = await _repository.GetByIdAsync(id);
        if (playerClub is null) return null;

        playerClub.PlayerId = dto.PlayerId;
        playerClub.ClubId = dto.ClubId;
        playerClub.StartDate = dto.StartDate;
        playerClub.EndDate = dto.EndDate;
        playerClub.IsCurrent = dto.IsCurrent;
        playerClub.ContractType = dto.ContractType;
        playerClub.ShirtNumber = dto.ShirtNumber;
        playerClub.PositionAtClub = dto.PositionAtClub;
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
}
