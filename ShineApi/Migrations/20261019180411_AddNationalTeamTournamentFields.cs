using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNationalTeamTournamentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwayPenaltyScore",
                table: "NationalTeamMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomePenaltyScore",
                table: "NationalTeamMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNeutral",
                table: "NationalTeamMatch",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "KickoffTime",
                table: "NationalTeamMatch",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stage",
                table: "NationalTeamMatch",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WentToExtraTime",
                table: "NationalTeamMatch",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Coach",
                table: "NationalTeam",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nickname",
                table: "NationalTeam",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwayPenaltyScore",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "HomePenaltyScore",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "IsNeutral",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "KickoffTime",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "Stage",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "WentToExtraTime",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "Coach",
                table: "NationalTeam");

            migrationBuilder.DropColumn(
                name: "Nickname",
                table: "NationalTeam");
        }
    }
}
