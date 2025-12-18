using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CommunityFinanceTracker.Models.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Username { get; set; }

    [MaxLength(255)]
    public string? PasswordHash { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(200)]
    public string? NextOfKin { get; set; }

    /// <summary>
    /// Stored as JSON array
    /// </summary>
    public string? ChildrenNames { get; set; }

    [MaxLength(200)]
    public string? SpouseName { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [MaxLength(500)]
    public string? PhotoUrl { get; set; }

    [Required]
    public UserRole Role { get; set; } = UserRole.User;

    [Required]
    public AuthMethod AuthMethod { get; set; } = AuthMethod.UsernamePassword;

    [MaxLength(255)]
    public string? ExternalAuthId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<Contribution> Contributions { get; set; } = new List<Contribution>();
    public virtual ICollection<Debt> Debts { get; set; } = new List<Debt>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public enum UserRole
{
    User = 0,
    Admin = 1
}

public enum AuthMethod
{
    UsernamePassword = 0,
    Facebook = 1,
    Google = 2
}
