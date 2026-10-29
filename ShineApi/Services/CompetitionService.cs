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
}
