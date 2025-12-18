using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class ContributionRepository : Repository<Contribution>, IContributionRepository
{
    public ContributionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Contribution>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Contribution>> GetByUserIdWithCategoryAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Category)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.UserId == userId)
            .SumAsync(c => c.Amount, cancellationToken);
    }

    public async Task<IEnumerable<Contribution>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Category)
            .Where(c => c.UserId == userId && c.Date >= startDate && c.Date <= endDate)
            .OrderByDescending(c => c.Date)
            .ToListAsync(cancellationToken);
    }
}
