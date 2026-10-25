using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShineApi.Services.Interfaces;

namespace ShineApi.Controllers;

/// <summary>Combined-download endpoints that span several entities.</summary>
[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IAppearanceExportService _appearances;

    public ExportController(IAppearanceExportService appearances)
    {
        _appearances = appearances;
    }

    /// <summary>Every squad appearance, club and national, as a flat CSV or JSON
    /// download (format=csv|json).</summary>
    [HttpGet("appearances")]
    [AllowAnonymous]
    public async Task<IActionResult> Appearances([FromQuery] string format = "csv")
    {
        var file = await _appearances.ExportAsync(format);
        if (file is null)
            return BadRequest(new { errors = new[] { "format must be 'csv' or 'json'." } });

        return File(file.Content, file.ContentType, file.FileName);
    }
}
