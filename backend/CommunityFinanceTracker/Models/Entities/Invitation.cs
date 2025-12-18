using System.ComponentModel.DataAnnotations;

namespace CommunityFinanceTracker.Models.Entities;

public class Invitation
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Token { get; set; } = string.Empty;

    [Required]
    public DateTime ExpirationDate { get; set; }

    public bool IsUsed { get; set; } = false;

    public int? UsedByUserId { get; set; }

    public DateTime? UsedAt { get; set; }

    public int CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
