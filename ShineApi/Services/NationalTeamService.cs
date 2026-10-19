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
}
