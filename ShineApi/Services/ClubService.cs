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
}
