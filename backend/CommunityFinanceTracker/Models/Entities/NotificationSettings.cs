using System.ComponentModel.DataAnnotations;

namespace CommunityFinanceTracker.Models.Entities;

public class NotificationSettings
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Day of month for monthly notifications (1-31). Default is first Sunday logic handled in service.
    /// </summary>
    public int? DayOfMonth { get; set; }

    /// <summary>
    /// Day of week for notifications (0=Sunday, 6=Saturday)
    /// </summary>
    public DayOfWeek? DayOfWeek { get; set; } = System.DayOfWeek.Sunday;

    /// <summary>
    /// Week of month (1=first, 2=second, etc.)
    /// </summary>
    public int WeekOfMonth { get; set; } = 1;

    /// <summary>
    /// Hour of day to send notifications (0-23)
    /// </summary>
    public int Hour { get; set; } = 9;

    public bool IsEnabled { get; set; } = true;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
