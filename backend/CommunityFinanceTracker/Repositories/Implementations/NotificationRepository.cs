using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.NotificationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetPendingNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(n => n.User)
            .Where(n => !n.IsSent && n.NotificationDate <= now)
            .OrderBy(n => n.NotificationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetUnsentNotificationsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(n => n.User)
            .Where(n => !n.IsSent && n.NotificationDate <= beforeDate)
            .OrderBy(n => n.NotificationDate)
            .ToListAsync(cancellationToken);
    }
}

public class NotificationSettingsRepository : Repository<NotificationSettings>, INotificationSettingsRepository
{
    public NotificationSettingsRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<NotificationSettings?> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(cancellationToken);
    }
}
