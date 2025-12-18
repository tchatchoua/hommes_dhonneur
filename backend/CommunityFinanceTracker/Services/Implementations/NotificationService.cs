using AutoMapper;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationSettingsRepository _notificationSettingsRepository;
    private readonly IUserRepository _userRepository;
    private readonly IContributionRepository _contributionRepository;
    private readonly IDebtRepository _debtRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository notificationRepository,
        INotificationSettingsRepository notificationSettingsRepository,
        IUserRepository userRepository,
        IContributionRepository contributionRepository,
        IDebtRepository debtRepository,
        IMapper mapper,
        ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _notificationSettingsRepository = notificationSettingsRepository;
        _userRepository = userRepository;
        _contributionRepository = contributionRepository;
        _debtRepository = debtRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(userId, cancellationToken);
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }

    public async Task<NotificationSettingsDto?> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _notificationSettingsRepository.GetSettingsAsync(cancellationToken);
        return settings == null ? null : _mapper.Map<NotificationSettingsDto>(settings);
    }

    public async Task<NotificationSettingsDto?> UpdateSettingsAsync(UpdateNotificationSettingsDto dto, CancellationToken cancellationToken = default)
    {
        var settings = await _notificationSettingsRepository.GetSettingsAsync(cancellationToken);
        if (settings == null)
        {
            settings = new NotificationSettings();
            await _notificationSettingsRepository.AddAsync(settings, cancellationToken);
        }

        _mapper.Map(dto, settings);
        settings.UpdatedAt = DateTime.UtcNow;

        await _notificationSettingsRepository.UpdateAsync(settings, cancellationToken);

        _logger.LogInformation("Notification settings updated");

        return _mapper.Map<NotificationSettingsDto>(settings);
    }

    public async Task CreateBalanceNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _notificationSettingsRepository.GetSettingsAsync(cancellationToken);
        if (settings == null || !settings.IsEnabled)
        {
            return;
        }

        var nextNotificationDate = await GetNextNotificationDateAsync(cancellationToken);
        var users = await _userRepository.GetActiveUsersAsync(cancellationToken);

        foreach (var user in users)
        {
            var totalContributions = await _contributionRepository.GetTotalByUserIdAsync(user.Id, cancellationToken);
            var totalDebts = await _debtRepository.GetTotalByUserIdAsync(user.Id, cancellationToken);
            var balance = totalContributions - totalDebts;

            var message = $"Monthly Balance Update: Your current balance is {balance:C}. " +
                          $"Total contributions: {totalContributions:C}, Total debts: {totalDebts:C}.";

            var notification = new Notification
            {
                UserId = user.Id,
                Message = message,
                NotificationDate = nextNotificationDate,
                Type = NotificationType.BalanceReminder,
                IsSent = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification, cancellationToken);
        }

        _logger.LogInformation("Created balance notifications for {Count} users", users.Count());
    }

    public async Task SendPendingNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var pendingNotifications = await _notificationRepository.GetPendingNotificationsAsync(cancellationToken);

        foreach (var notification in pendingNotifications)
        {
            try
            {
                // In production, integrate with email/push notification service
                // await _emailService.SendAsync(notification.User.Email, "Balance Update", notification.Message);

                notification.IsSent = true;
                notification.SentAt = DateTime.UtcNow;
                await _notificationRepository.UpdateAsync(notification, cancellationToken);

                _logger.LogInformation("Notification {NotificationId} sent to user {UserId}", 
                    notification.Id, notification.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification {NotificationId}", notification.Id);
            }
        }
    }

    public async Task<DateTime> GetNextNotificationDateAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _notificationSettingsRepository.GetSettingsAsync(cancellationToken);
        if (settings == null)
        {
            // Default: First Sunday of the month at 9 AM
            return GetFirstDayOfWeekInMonth(DateTime.UtcNow.AddMonths(1), DayOfWeek.Sunday).AddHours(9);
        }

        var now = DateTime.UtcNow;
        var targetMonth = now.Day <= 7 ? now : now.AddMonths(1);

        DateTime notificationDate;
        if (settings.DayOfMonth.HasValue)
        {
            // Specific day of month
            var day = Math.Min(settings.DayOfMonth.Value, DateTime.DaysInMonth(targetMonth.Year, targetMonth.Month));
            notificationDate = new DateTime(targetMonth.Year, targetMonth.Month, day, settings.Hour, 0, 0, DateTimeKind.Utc);
        }
        else if (settings.DayOfWeek.HasValue)
        {
            // Specific week and day of week
            notificationDate = GetNthDayOfWeekInMonth(targetMonth, settings.DayOfWeek.Value, settings.WeekOfMonth)
                .AddHours(settings.Hour);
        }
        else
        {
            // Default: First Sunday
            notificationDate = GetFirstDayOfWeekInMonth(targetMonth, DayOfWeek.Sunday).AddHours(settings.Hour);
        }

        return notificationDate;
    }

    private static DateTime GetFirstDayOfWeekInMonth(DateTime date, DayOfWeek dayOfWeek)
    {
        var firstOfMonth = new DateTime(date.Year, date.Month, 1);
        var daysUntilTarget = ((int)dayOfWeek - (int)firstOfMonth.DayOfWeek + 7) % 7;
        return firstOfMonth.AddDays(daysUntilTarget);
    }

    private static DateTime GetNthDayOfWeekInMonth(DateTime date, DayOfWeek dayOfWeek, int weekNumber)
    {
        var firstOccurrence = GetFirstDayOfWeekInMonth(date, dayOfWeek);
        return firstOccurrence.AddDays((weekNumber - 1) * 7);
    }
}
