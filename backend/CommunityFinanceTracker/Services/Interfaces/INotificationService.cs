using CommunityFinanceTracker.Models.DTOs;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<NotificationSettingsDto?> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task<NotificationSettingsDto?> UpdateSettingsAsync(UpdateNotificationSettingsDto dto, CancellationToken cancellationToken = default);
    Task CreateBalanceNotificationsAsync(CancellationToken cancellationToken = default);
    Task SendPendingNotificationsAsync(CancellationToken cancellationToken = default);
    Task<DateTime> GetNextNotificationDateAsync(CancellationToken cancellationToken = default);
}
