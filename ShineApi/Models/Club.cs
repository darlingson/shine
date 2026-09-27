namespace ShineApi.Models;

public class Club
{
    public int ClubId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? City { get; set; }
    public string Country { get; set; } = "Malawi";
    public int? FoundedYear { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
