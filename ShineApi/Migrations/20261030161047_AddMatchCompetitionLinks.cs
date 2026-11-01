using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchCompetitionLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompetitionId",
                table: "NationalTeamMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeasonId",
                table: "NationalTeamMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompetitionId",
                table: "ClubMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeasonId",
                table: "ClubMatch",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeamMatch_CompetitionId",
                table: "NationalTeamMatch",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeamMatch_SeasonId",
                table: "NationalTeamMatch",
                column: "SeasonId");

            migrationBuilder.CreateIndex(
                name: "IX_ClubMatch_CompetitionId",
                table: "ClubMatch",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ClubMatch_SeasonId",
                table: "ClubMatch",
                column: "SeasonId");

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMatch_CompetitionSeason_SeasonId",
                table: "ClubMatch",
                column: "SeasonId",
                principalTable: "CompetitionSeason",
                principalColumn: "SeasonId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMatch_Competition_CompetitionId",
                table: "ClubMatch",
                column: "CompetitionId",
                principalTable: "Competition",
                principalColumn: "CompetitionId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_NationalTeamMatch_CompetitionSeason_SeasonId",
                table: "NationalTeamMatch",
                column: "SeasonId",
                principalTable: "CompetitionSeason",
                principalColumn: "SeasonId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_NationalTeamMatch_Competition_CompetitionId",
                table: "NationalTeamMatch",
                column: "CompetitionId",
                principalTable: "Competition",
                principalColumn: "CompetitionId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClubMatch_CompetitionSeason_SeasonId",
                table: "ClubMatch");

            migrationBuilder.DropForeignKey(
                name: "FK_ClubMatch_Competition_CompetitionId",
                table: "ClubMatch");

            migrationBuilder.DropForeignKey(
                name: "FK_NationalTeamMatch_CompetitionSeason_SeasonId",
                table: "NationalTeamMatch");

            migrationBuilder.DropForeignKey(
                name: "FK_NationalTeamMatch_Competition_CompetitionId",
                table: "NationalTeamMatch");

            migrationBuilder.DropIndex(
                name: "IX_NationalTeamMatch_CompetitionId",
                table: "NationalTeamMatch");

            migrationBuilder.DropIndex(
                name: "IX_NationalTeamMatch_SeasonId",
                table: "NationalTeamMatch");

            migrationBuilder.DropIndex(
                name: "IX_ClubMatch_CompetitionId",
                table: "ClubMatch");

            migrationBuilder.DropIndex(
                name: "IX_ClubMatch_SeasonId",
                table: "ClubMatch");

            migrationBuilder.DropColumn(
                name: "CompetitionId",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "SeasonId",
                table: "NationalTeamMatch");

            migrationBuilder.DropColumn(
                name: "CompetitionId",
                table: "ClubMatch");

            migrationBuilder.DropColumn(
                name: "SeasonId",
                table: "ClubMatch");
        }
    }
}
