using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class SplitClubAndNationalTeamMatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Detach squads from the old generic Match before it goes away.
            migrationBuilder.DropForeignKey(
                name: "FK_ClubMatchSquad_Match_MatchId",
                table: "ClubMatchSquad");

            migrationBuilder.DropForeignKey(
                name: "FK_NationalTeamMatchSquad_Match_MatchId",
                table: "NationalTeamMatchSquad");

            migrationBuilder.CreateTable(
                name: "ClubMatch",
                columns: table => new
                {
                    MatchId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Competition = table.Column<string>(type: "text", nullable: true),
                    Season = table.Column<string>(type: "text", nullable: true),
                    HomeClubId = table.Column<int>(type: "integer", nullable: true),
                    AwayClubId = table.Column<int>(type: "integer", nullable: true),
                    HomeScore = table.Column<int>(type: "integer", nullable: true),
                    AwayScore = table.Column<int>(type: "integer", nullable: true),
                    Venue = table.Column<string>(type: "text", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClubMatch", x => x.MatchId);
                    table.ForeignKey(
                        name: "FK_ClubMatch_Club_AwayClubId",
                        column: x => x.AwayClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ClubMatch_Club_HomeClubId",
                        column: x => x.HomeClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "NationalTeamMatch",
                columns: table => new
                {
                    MatchId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Competition = table.Column<string>(type: "text", nullable: true),
                    Season = table.Column<string>(type: "text", nullable: true),
                    HomeNationalTeamId = table.Column<int>(type: "integer", nullable: true),
                    AwayNationalTeamId = table.Column<int>(type: "integer", nullable: true),
                    HomeScore = table.Column<int>(type: "integer", nullable: true),
                    AwayScore = table.Column<int>(type: "integer", nullable: true),
                    Venue = table.Column<string>(type: "text", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NationalTeamMatch", x => x.MatchId);
                    table.ForeignKey(
                        name: "FK_NationalTeamMatch_NationalTeam_AwayNationalTeamId",
                        column: x => x.AwayNationalTeamId,
                        principalTable: "NationalTeam",
                        principalColumn: "NationalTeamId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NationalTeamMatch_NationalTeam_HomeNationalTeamId",
                        column: x => x.HomeNationalTeamId,
                        principalTable: "NationalTeam",
                        principalColumn: "NationalTeamId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClubMatch_AwayClubId",
                table: "ClubMatch",
                column: "AwayClubId");

            migrationBuilder.CreateIndex(
                name: "IX_ClubMatch_HomeClubId",
                table: "ClubMatch",
                column: "HomeClubId");

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeamMatch_AwayNationalTeamId",
                table: "NationalTeamMatch",
                column: "AwayNationalTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeamMatch_HomeNationalTeamId",
                table: "NationalTeamMatch",
                column: "HomeNationalTeamId");

            // Existing matches were club matches; carry them over (ids preserved)
            // with null team links so they can be linked afterwards.
            migrationBuilder.Sql(
                """
                INSERT INTO "ClubMatch" ("MatchId", "MatchDate", "Competition", "Season", "HomeScore", "AwayScore", "Venue", "SourceUrl", "CreatedAt", "UpdatedAt")
                SELECT "MatchId", "MatchDate", "Competition", "Season", "HomeScore", "AwayScore", "Venue", "SourceUrl", "CreatedAt", "UpdatedAt"
                FROM "Match";
                """);

            migrationBuilder.Sql(
                """
                SELECT setval(
                    pg_get_serial_sequence('"ClubMatch"', 'MatchId'),
                    COALESCE((SELECT MAX("MatchId") FROM "ClubMatch"), 1),
                    (SELECT COUNT(*) FROM "ClubMatch") > 0);
                """);

            migrationBuilder.DropTable(name: "Match");

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMatchSquad_ClubMatch_MatchId",
                table: "ClubMatchSquad",
                column: "MatchId",
                principalTable: "ClubMatch",
                principalColumn: "MatchId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NationalTeamMatchSquad_NationalTeamMatch_MatchId",
                table: "NationalTeamMatchSquad",
                column: "MatchId",
                principalTable: "NationalTeamMatch",
                principalColumn: "MatchId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClubMatchSquad_ClubMatch_MatchId",
                table: "ClubMatchSquad");

            migrationBuilder.DropForeignKey(
                name: "FK_NationalTeamMatchSquad_NationalTeamMatch_MatchId",
                table: "NationalTeamMatchSquad");

            migrationBuilder.CreateTable(
                name: "Match",
                columns: table => new
                {
                    MatchId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AwayScore = table.Column<int>(type: "integer", nullable: true),
                    AwayTeam = table.Column<string>(type: "text", nullable: true),
                    Competition = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HomeScore = table.Column<int>(type: "integer", nullable: true),
                    HomeTeam = table.Column<string>(type: "text", nullable: true),
                    MatchDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Season = table.Column<string>(type: "text", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Venue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Match", x => x.MatchId);
                });

            // Carry club matches back; team names are not recoverable from the
            // link-only model, so they are left null.
            migrationBuilder.Sql(
                """
                INSERT INTO "Match" ("MatchId", "MatchDate", "Competition", "Season", "HomeScore", "AwayScore", "Venue", "SourceUrl", "CreatedAt", "UpdatedAt")
                SELECT "MatchId", "MatchDate", "Competition", "Season", "HomeScore", "AwayScore", "Venue", "SourceUrl", "CreatedAt", "UpdatedAt"
                FROM "ClubMatch";
                """);

            migrationBuilder.Sql(
                """
                SELECT setval(
                    pg_get_serial_sequence('"Match"', 'MatchId'),
                    COALESCE((SELECT MAX("MatchId") FROM "Match"), 1),
                    (SELECT COUNT(*) FROM "Match") > 0);
                """);

            migrationBuilder.DropTable(name: "ClubMatch");

            migrationBuilder.DropTable(name: "NationalTeamMatch");

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMatchSquad_Match_MatchId",
                table: "ClubMatchSquad",
                column: "MatchId",
                principalTable: "Match",
                principalColumn: "MatchId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NationalTeamMatchSquad_Match_MatchId",
                table: "NationalTeamMatchSquad",
                column: "MatchId",
                principalTable: "Match",
                principalColumn: "MatchId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
