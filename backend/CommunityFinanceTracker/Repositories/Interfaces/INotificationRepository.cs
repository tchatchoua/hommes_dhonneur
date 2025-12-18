using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Repositories.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Notification>> GetPendingNotificationsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Notification>> GetUnsentNotificationsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
}

public interface INotificationSettingsRepository : IRepository<NotificationSettings>
{
    Task<NotificationSettings?> GetSettingsAsync(CancellationToken cancellationToken = default);
}
