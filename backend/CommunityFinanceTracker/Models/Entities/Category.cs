using System.ComponentModel.DataAnnotations;

namespace CommunityFinanceTracker.Models.Entities;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public CategoryType Type { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Contribution> Contributions { get; set; } = new List<Contribution>();
    public virtual ICollection<Debt> Debts { get; set; } = new List<Debt>();
}

public enum CategoryType
{
    Contribution = 0,
    Debt = 1
}
