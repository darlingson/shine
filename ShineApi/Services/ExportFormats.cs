using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace ShineApi.Services;

/// <summary>Shared helpers for the CSV/JSON export endpoints.</summary>
public static class ExportFormats
{
    public static bool IsSupported(string format)
        => IsCsv(format)
            || string.Equals(format, "json", StringComparison.OrdinalIgnoreCase);

    public static bool IsCsv(string format)
        => string.Equals(format, "csv", StringComparison.OrdinalIgnoreCase);

    /// <summary>JSON options matching the API's camelCase responses.</summary>
    public static JsonSerializerOptions JsonOptions { get; } = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>UTF-8 BOM so Excel detects the encoding when opened by double-click.</summary>
    public static byte[] WithUtf8Bom(StringBuilder csv)
        => new byte[] { 0xEF, 0xBB, 0xBF }
            .Concat(Encoding.UTF8.GetBytes(csv.ToString()))
            .ToArray();
}
