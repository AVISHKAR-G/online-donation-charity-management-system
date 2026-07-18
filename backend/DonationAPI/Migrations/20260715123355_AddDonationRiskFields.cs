using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationRiskFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFlaggedForReview",
                table: "Donations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RiskFlags",
                table: "Donations",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "RiskScore",
                table: "Donations",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFlaggedForReview",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "RiskFlags",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "RiskScore",
                table: "Donations");
        }
    }
}
