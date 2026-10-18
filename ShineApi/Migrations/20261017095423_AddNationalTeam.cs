using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNationalTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_NationalTeamMatchSquad",
                table: "NationalTeamMatchSquad");

            migrationBuilder.DropColumn(
                name: "NationalTeam",
                table: "NationalTeamMatchSquad");

            migrationBuilder.AddColumn<int>(
                name: "NationalTeamId",
                table: "NationalTeamMatchSquad",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_NationalTeamMatchSquad",
                table: "NationalTeamMatchSquad",
                columns: new[] { "MatchId", "NationalTeamId", "PlayerId" });

            migrationBuilder.CreateTable(
                name: "NationalTeam",
                columns: table => new
                {
                    NationalTeamId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: false),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NationalTeam", x => x.NationalTeamId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeamMatchSquad_NationalTeamId",
                table: "NationalTeamMatchSquad",
                column: "NationalTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_NationalTeam_Name",
                table: "NationalTeam",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_NationalTeamMatchSquad_NationalTeam_NationalTeamId",
                table: "NationalTeamMatchSquad",
                column: "NationalTeamId",
                principalTable: "NationalTeam",
                principalColumn: "NationalTeamId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NationalTeamMatchSquad_NationalTeam_NationalTeamId",
                table: "NationalTeamMatchSquad");

            migrationBuilder.DropTable(
                name: "NationalTeam");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NationalTeamMatchSquad",
                table: "NationalTeamMatchSquad");

            migrationBuilder.DropIndex(
                name: "IX_NationalTeamMatchSquad_NationalTeamId",
                table: "NationalTeamMatchSquad");

            migrationBuilder.DropColumn(
                name: "NationalTeamId",
                table: "NationalTeamMatchSquad");

            migrationBuilder.AddColumn<string>(
                name: "NationalTeam",
                table: "NationalTeamMatchSquad",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NationalTeamMatchSquad",
                table: "NationalTeamMatchSquad",
                columns: new[] { "MatchId", "NationalTeam", "PlayerId" });
        }
    }
}
