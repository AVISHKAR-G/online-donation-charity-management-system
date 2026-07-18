using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAidDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Beneficiaries",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ApplicationId",
                table: "Beneficiaries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Beneficiaries",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Beneficiaries",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AidDeliveries",
                columns: table => new
                {
                    AidDeliveryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    VolunteerId = table.Column<int>(type: "int", nullable: false),
                    AmountDelivered = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Method = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ScheduledAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AidDeliveries", x => x.AidDeliveryId);
                    table.ForeignKey(
                        name: "FK_AidDeliveries_AssistanceApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "AssistanceApplications",
                        principalColumn: "ApplicationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AidDeliveries_Users_VolunteerId",
                        column: x => x.VolunteerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Beneficiaries_ApplicationId",
                table: "Beneficiaries",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_AidDeliveries_ApplicationId",
                table: "AidDeliveries",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_AidDeliveries_VolunteerId",
                table: "AidDeliveries",
                column: "VolunteerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Beneficiaries_AssistanceApplications_ApplicationId",
                table: "Beneficiaries",
                column: "ApplicationId",
                principalTable: "AssistanceApplications",
                principalColumn: "ApplicationId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Beneficiaries_AssistanceApplications_ApplicationId",
                table: "Beneficiaries");

            migrationBuilder.DropTable(
                name: "AidDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_Beneficiaries_ApplicationId",
                table: "Beneficiaries");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Beneficiaries");

            migrationBuilder.DropColumn(
                name: "ApplicationId",
                table: "Beneficiaries");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Beneficiaries");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Beneficiaries");
        }
    }
}
