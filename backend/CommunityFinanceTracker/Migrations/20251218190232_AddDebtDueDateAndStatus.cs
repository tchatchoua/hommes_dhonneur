using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CommunityFinanceTracker.Migrations
{
    /// <inheritdoc />
    public partial class AddDebtDueDateAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Debts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Debts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Debts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Debts");
        }
    }
}
