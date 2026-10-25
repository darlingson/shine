using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RoleAtClub",
                table: "PlayerClub",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryRole",
                table: "Player",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryRole",
                table: "Player",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "NationalTeamMatchSquad",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "ClubMatchSquad",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoleAtClub",
                table: "PlayerClub");

            migrationBuilder.DropColumn(
                name: "PrimaryRole",
                table: "Player");

            migrationBuilder.DropColumn(
                name: "SecondaryRole",
                table: "Player");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "NationalTeamMatchSquad");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "ClubMatchSquad");
        }
    }
}
