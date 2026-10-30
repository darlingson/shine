using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ShineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddStaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StaffMember",
                columns: table => new
                {
                    StaffMemberId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    KnownAs = table.Column<string>(type: "text", nullable: true),
                    Nationality = table.Column<string>(type: "text", nullable: false),
                    PlayerId = table.Column<int>(type: "integer", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffMember", x => x.StaffMemberId);
                    table.ForeignKey(
                        name: "FK_StaffMember_Player_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Player",
                        principalColumn: "PlayerId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StaffAppointment",
                columns: table => new
                {
                    StaffAppointmentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StaffMemberId = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    ClubId = table.Column<int>(type: "integer", nullable: true),
                    NationalTeamId = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffAppointment", x => x.StaffAppointmentId);
                    table.ForeignKey(
                        name: "FK_StaffAppointment_Club_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StaffAppointment_NationalTeam_NationalTeamId",
                        column: x => x.NationalTeamId,
                        principalTable: "NationalTeam",
                        principalColumn: "NationalTeamId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StaffAppointment_StaffMember_StaffMemberId",
                        column: x => x.StaffMemberId,
                        principalTable: "StaffMember",
                        principalColumn: "StaffMemberId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StaffAppointment_ClubId",
                table: "StaffAppointment",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAppointment_NationalTeamId",
                table: "StaffAppointment",
                column: "NationalTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAppointment_StaffMemberId",
                table: "StaffAppointment",
                column: "StaffMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffMember_PlayerId",
                table: "StaffMember",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StaffAppointment");

            migrationBuilder.DropTable(
                name: "StaffMember");
        }
    }
}
