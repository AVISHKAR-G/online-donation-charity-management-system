using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationAdminMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminMessage",
                table: "Donations",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminMessage",
                table: "Donations");
        }
    }
}
