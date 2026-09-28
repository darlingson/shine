namespace ShineApi.Dtos;

public class CreatePlayerClubDto
{
    public int PlayerId { get; set; }
    public int ClubId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;
    public string? ContractType { get; set; }
    public int? ShirtNumber { get; set; }
    public string? PositionAtClub { get; set; }
    public string? SourceUrl { get; set; }
}

public class UpdatePlayerClubDto
{
    public int PlayerId { get; set; }
    public int ClubId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;
    public string? ContractType { get; set; }
    public int? ShirtNumber { get; set; }
    public string? PositionAtClub { get; set; }
    public string? SourceUrl { get; set; }
}
