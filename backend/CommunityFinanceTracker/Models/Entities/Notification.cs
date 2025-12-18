using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CommunityFinanceTracker.Models.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public DateTime NotificationDate { get; set; }

    public bool IsSent { get; set; } = false;

    public DateTime? SentAt { get; set; }

    public NotificationType Type { get; set; } = NotificationType.BalanceReminder;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}

public enum NotificationType
{
    BalanceReminder = 0,
    ContributionAdded = 1,
    DebtAdded = 2,
    General = 3
}
