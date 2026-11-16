using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

/// <summary>The landing spotlight: one rotating player and one rotating team,
/// a pure function of the date — no state, reproducible for any day.</summary>
[ApiController]
[Route("api/Spotlight")]
public class SpotlightController : ControllerBase
{
    private readonly ISpotlightService _service;

    public SpotlightController(ISpotlightService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromQuery] string? date)
    {
        DateOnly? asOf = null;
        if (!string.IsNullOrWhiteSpace(date))
        {
            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out var parsed))
                return BadRequest(new { errors = new[] { "date must be YYYY-MM-DD." } });
            asOf = parsed;
        }

        // The pick rotates daily, but the record beneath it can gain facts any
        // minute — cache long enough to absorb bursts, short enough to stay fresh.
        Response.Headers.CacheControl = "public, max-age=600";
        return Ok(await _service.GetAsync(asOf));
    }
}
