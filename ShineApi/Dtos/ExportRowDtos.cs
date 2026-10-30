namespace ShineApi.Dtos;

/// <summary>Flat export rows shared by the CSV and JSON downloads: the JSON
/// property names are exactly the CSV headers, so both formats describe the
/// same columns with the same values (dates as yyyy-MM-dd, kickoff as
/// HH:mm). Records are deliberately export-shaped — resolved display names
/// beside every ID, UTC timestamps — not database entities.</summary>
public record PlayerCareerStintRow(
    int StintId,
    int PlayerId,
    string? PlayerName,
    int ClubId,
    string? ClubName,
    string? StartDate,
    string? EndDate,
    bool IsCurrent,
    string? ContractType,
    int? ShirtNumber,
    string? PositionAtClub,
    string? RoleAtClub,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CompetitionRow(
    int CompetitionId,
    string Name,
    string? ShortName,
    string Kind,
    int? Tier,
    string? Scope,
    string? Region,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record StaffMemberRow(
    int StaffMemberId,
    string FullName,
    string? KnownAs,
    string Nationality,
    int? PlayerId,
    string? PlayerName,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record StaffAppointmentRow(
    int StaffAppointmentId,
    int StaffMemberId,
    string? StaffMemberName,
    string Role,
    int? ClubId,
    string? ClubName,
    int? NationalTeamId,
    string? NationalTeamName,
    string? StartDate,
    string? EndDate,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CompetitionSeasonRow(
    int SeasonId,
    int CompetitionId,
    string? CompetitionName,
    string? Label,
    string? Name,
    string? StartDate,
    string? EndDate,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ClubMatchRow(
    int MatchId,
    string MatchDate,
    string? Competition,
    string? Season,
    int? CompetitionId,
    string? CompetitionName,
    int? SeasonId,
    string? SeasonName,
    int? HomeClubId,
    string? HomeClubName,
    int? AwayClubId,
    string? AwayClubName,
    int? HomeScore,
    int? AwayScore,
    string? Venue,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record NationalTeamMatchRow(
    int MatchId,
    string MatchDate,
    string? KickoffTime,
    string? Competition,
    string? Season,
    int? CompetitionId,
    string? CompetitionName,
    int? SeasonId,
    string? SeasonName,
    string? Stage,
    int? HomeNationalTeamId,
    string? HomeNationalTeamName,
    int? AwayNationalTeamId,
    string? AwayNationalTeamName,
    int? HomeScore,
    int? AwayScore,
    string? Venue,
    bool IsNeutral,
    bool WentToExtraTime,
    int? HomePenaltyScore,
    int? AwayPenaltyScore,
    string? SourceUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);
