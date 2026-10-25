namespace ShineApi.Services;

/// <summary>A generated export download: bytes ready for FileContentResult.</summary>
public record ExportFile(string FileName, string ContentType, byte[] Content);
