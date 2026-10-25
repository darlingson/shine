using System.Text;

namespace ShineApi.Services;

/// <summary>Minimal CSV serialization shared by the export endpoints. Handles
/// quoting, embedded commas/quotes/newlines, and null/empty values.</summary>
public static class Csv
{
    public static void AppendEscaped(StringBuilder line, string? value)
    {
        value ??= string.Empty;

        var needsQuoting = value.Contains('"')
            || value.Contains(',')
            || value.Contains('\n')
            || value.Contains('\r');

        line.Append(needsQuoting
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value);
    }
}
