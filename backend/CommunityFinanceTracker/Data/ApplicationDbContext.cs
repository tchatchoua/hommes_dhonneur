using CommunityFinanceTracker.Models.Entities;

using Microsoft.EntityFrameworkCore;

namespace CommunityFinanceTracker.Data;

public class ApplicationDbContext(IConfiguration configuration,
    DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Contribution> Contributions => Set<Contribution>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationSettings> NotificationSettings => Set<NotificationSettings>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            _ = optionsBuilder.UseSqlServer(connectionString);
        }
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
            entity.Property(e => e.AuthMethod).HasConversion<string>();
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasIndex(e => new { e.Name, e.Type }).IsUnique();
        });

        // Contribution configuration
        modelBuilder.Entity<Contribution>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithMany(u => u.Contributions)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Category)
                .WithMany(cat => cat.Contributions)
                .HasForeignKey(c => c.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Debt configuration
        modelBuilder.Entity<Debt>(entity =>
        {
            entity.HasOne(d => d.User)
                .WithMany(u => u.Debts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Category)
                .WithMany(cat => cat.Debts)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // NotificationSettings configuration
        modelBuilder.Entity<NotificationSettings>(entity =>
        {
            entity.Property(e => e.DayOfWeek).HasConversion<string>();
        });

        // Seed default notification settings
        modelBuilder.Entity<NotificationSettings>().HasData(new NotificationSettings
        {
            Id = 1,
            DayOfWeek = DayOfWeek.Sunday,
            WeekOfMonth = 1,
            Hour = 9,
            IsEnabled = true,
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed default categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Monthly Dues", Type = CategoryType.Contribution, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Category { Id = 2, Name = "Special Contribution", Type = CategoryType.Contribution, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Category { Id = 3, Name = "Loan", Type = CategoryType.Debt, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Category { Id = 4, Name = "Penalty", Type = CategoryType.Debt, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
