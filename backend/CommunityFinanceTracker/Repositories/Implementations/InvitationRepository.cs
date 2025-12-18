using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class InvitationRepository : Repository<Invitation>, IInvitationRepository
{
    public InvitationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Invitation?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);
    }

    public async Task<IEnumerable<Invitation>> GetValidInvitationsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(i => !i.IsUsed && i.ExpirationDate > now)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Invitation>> GetExpiredInvitationsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(i => !i.IsUsed && i.ExpirationDate <= now)
            .ToListAsync(cancellationToken);
    }
}
