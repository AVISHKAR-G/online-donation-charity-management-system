using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Donations",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Donations");
        }
    }
}
