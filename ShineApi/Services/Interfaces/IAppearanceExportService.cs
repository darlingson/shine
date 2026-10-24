namespace ShineApi.Services.Interfaces;

/// <summary>Combined club and national match appearance export.</summary>
public interface IAppearanceExportService
{
    Task<ExportFile?> ExportAsync(string format);
}
