using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactPharmacyPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToMedicineFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Medicines",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Medicines");
        }
    }
}
