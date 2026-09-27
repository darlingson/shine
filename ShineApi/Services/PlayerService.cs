using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

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
}
