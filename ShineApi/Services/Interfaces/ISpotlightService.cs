using ShineApi.Dtos;

namespace ShineApi.Services.Interfaces;

public interface ISpotlightService
{
    /// <summary>
    /// The landing spotlight bundle: one rotating player and one rotating team,
    /// computed as a pure function of the rotation date. <paramref name="asOf"/>
    /// null means today (UTC). Either section is null when the record is empty.
    /// </summary>
    Task<SpotlightResponseDto> GetAsync(DateOnly? asOf);
}
