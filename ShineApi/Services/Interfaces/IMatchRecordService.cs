using ShineApi.Dtos;
using ShineApi.Models;

namespace ShineApi.Services.Interfaces;

public interface IMatchRecordService
{
    /// <summary>
    /// Records a full match (match + squad rows) in one transaction.
    /// Returns null when the payload is invalid; <paramref name="errors"/>
    /// carries per-row reasons.
    /// </summary>
    Task<MatchRecordResultDto?> CreateAsync(CreateMatchRecordDto dto, List<string> errors);

    Task<List<ReviewFlagDto>> GetFlagsAsync(string? status, int page, int pageSize);
    Task<ReviewFlagDto?> ResolveFlagAsync(int id, string status);
    Task<bool> DeleteFlagAsync(int id);
}
