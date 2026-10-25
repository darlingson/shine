using System.Text;
using System.Text.Json;
using ShineApi.Dtos;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

/// <summary>Builds the combined appearances export by joining both squad tables
/// to their players, teams, and matches.</summary>
public class AppearanceExportService : IAppearanceExportService
{
    private readonly IClubMatchSquadRepository _clubSquads;
    private readonly INationalTeamMatchSquadRepository _nationalSquads;

    public AppearanceExportService(
        IClubMatchSquadRepository clubSquads,
        INationalTeamMatchSquadRepository nationalSquads)
    {
        _clubSquads = clubSquads;
        _nationalSquads = nationalSquads;
    }

    /// <summary>Full appearance list as a CSV or JSON download. One flat row per
    /// squad entry (ClubMatchSquad + NationalTeamMatchSquad) with player, team,
    /// opponent and match context resolved; blank cells mean null. Dates and
    /// times are ISO 8601.</summary>
    public async Task<ExportFile?> ExportAsync(string format)
    {
        if (!ExportFormats.IsSupported(format))
            return null;

        var clubRows = (await _clubSquads.GetAllForExportAsync())
            .Select(s =>
            {
                var opponent = s.Match is not null
                    && s.Match.HomeClubId == s.ClubId
                    ? s.Match.AwayClub
                    : s.Match?.HomeClub;
                return new MatchAppearanceDto
                {
                    MatchScope = "club",
                    MatchId = s.MatchId,
                    MatchDate = s.Match?.MatchDate,
                    Competition = s.Match?.Competition,
                    Season = s.Match?.Season,
                    TeamId = s.ClubId,
                    TeamName = s.Club?.Name,
                    OpponentId = opponent?.ClubId,
                    OpponentName = opponent?.Name,
                    HomeScore = s.Match?.HomeScore,
                    AwayScore = s.Match?.AwayScore,
                    PlayerId = s.PlayerId,
                    PlayerName = s.Player?.FullName,
                    LineupStatus = s.LineupStatus,
                    ShirtNumber = s.ShirtNumber,
                    Position = s.Position,
                    Role = s.Role,
                    MinutesPlayed = s.MinutesPlayed,
                    Goals = s.Goals,
                    Assists = s.Assists,
                    YellowCards = s.YellowCards,
                    RedCards = s.RedCards,
                    Captain = s.Captain,
                    Notes = s.Notes,
                    SourceUrl = s.SourceUrl,
                    CreatedAt = s.Match?.CreatedAt,
                    UpdatedAt = s.Match?.UpdatedAt,
                };
            });

        var nationalRows = (await _nationalSquads.GetAllForExportAsync())
            .Select(s =>
            {
                var opponent = s.Match is not null
                    && s.Match.HomeNationalTeamId == s.NationalTeamId
                    ? s.Match.AwayNationalTeam
                    : s.Match?.HomeNationalTeam;
                return new MatchAppearanceDto
                {
                    MatchScope = "national",
                    MatchId = s.MatchId,
                    MatchDate = s.Match?.MatchDate,
                    KickoffTime = s.Match?.KickoffTime,
                    Competition = s.Match?.Competition,
                    Season = s.Match?.Season,
                    Stage = s.Match?.Stage,
                    TeamId = s.NationalTeamId,
                    TeamName = s.NationalTeam?.Name,
                    OpponentId = opponent?.NationalTeamId,
                    OpponentName = opponent?.Name,
                    HomeScore = s.Match?.HomeScore,
                    AwayScore = s.Match?.AwayScore,
                    IsNeutral = s.Match?.IsNeutral,
                    WentToExtraTime = s.Match?.WentToExtraTime,
                    PlayerId = s.PlayerId,
                    PlayerName = s.Player?.FullName,
                    LineupStatus = s.LineupStatus,
                    ShirtNumber = s.ShirtNumber,
                    Position = s.Position,
                    Role = s.Role,
                    MinutesPlayed = s.MinutesPlayed,
                    Goals = s.Goals,
                    Assists = s.Assists,
                    YellowCards = s.YellowCards,
                    RedCards = s.RedCards,
                    Captain = s.Captain,
                    Notes = s.Notes,
                    SourceUrl = s.SourceUrl,
                    CreatedAt = s.Match?.CreatedAt,
                    UpdatedAt = s.Match?.UpdatedAt,
                };
            });

        var rows = clubRows
            .Concat(nationalRows)
            .Where(r => r.MatchDate is not null)
            .OrderByDescending(r => r.MatchDate)
            .ThenBy(r => r.MatchScope)
            .ThenBy(r => r.TeamName)
            .ThenBy(r => r.PlayerName)
            .ToList();

        if (ExportFormats.IsCsv(format))
        {
            var csv = new StringBuilder();
            csv.Append("matchScope,matchId,matchDate,kickoffTime,competition,season,stage,teamId,teamName,opponentId,opponentName,homeScore,awayScore,isNeutral,wentToExtraTime,playerId,playerName,lineupStatus,shirtNumber,position,role,minutesPlayed,goals,assists,yellowCards,redCards,captain,notes,sourceUrl,createdAt,updatedAt");
            foreach (var r in rows)
            {
                csv.AppendLine();
                Csv.AppendEscaped(csv, r.MatchScope);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.MatchId.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.MatchDate?.ToString("yyyy-MM-dd"));
                csv.Append(',');
                Csv.AppendEscaped(csv, r.KickoffTime?.ToString("HH:mm"));
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Competition);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Season);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Stage);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.TeamId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.TeamName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.OpponentId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.OpponentName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.HomeScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.AwayScore?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, BoolText(r.IsNeutral));
                csv.Append(',');
                Csv.AppendEscaped(csv, BoolText(r.WentToExtraTime));
                csv.Append(',');
                Csv.AppendEscaped(csv, r.PlayerId?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.PlayerName);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.LineupStatus);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.ShirtNumber?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Position);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Role);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.MinutesPlayed?.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Goals.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Assists.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.YellowCards.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.RedCards.ToString());
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Captain ? "true" : "false");
                csv.Append(',');
                Csv.AppendEscaped(csv, r.Notes);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.SourceUrl);
                csv.Append(',');
                Csv.AppendEscaped(csv, r.CreatedAt is null ? null : ExportFormats.IsoTimestamp(r.CreatedAt.Value));
                csv.Append(',');
                Csv.AppendEscaped(csv, r.UpdatedAt is null ? null : ExportFormats.IsoTimestamp(r.UpdatedAt.Value));
            }

            return new ExportFile(
                "match-appearances.csv",
                "text/csv; charset=utf-8",
                ExportFormats.WithUtf8Bom(csv));
        }

        var json = JsonSerializer.Serialize(rows, ExportFormats.JsonOptions);
        return new ExportFile(
            "match-appearances.json",
            "application/json; charset=utf-8",
            Encoding.UTF8.GetBytes(json));
    }

    private static string? BoolText(bool? value)
        => value is null ? null : value.Value ? "true" : "false";
}
