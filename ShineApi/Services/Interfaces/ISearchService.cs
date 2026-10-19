using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface ISearchService
{
    /// <summary>Cross-entity keyword search. <paramref name="kinds"/> null or empty means every kind.</summary>
    Task<SearchResponseDto> SearchAsync(string? query, IReadOnlyList<string>? kinds, int limit);
}