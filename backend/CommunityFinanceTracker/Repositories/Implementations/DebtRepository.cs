using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class DebtRepository : Repository<Debt>, IDebtRepository
{
    public DebtRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Debt>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Debt>> GetByUserIdWithCategoryAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Category)
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.UserId == userId)
            .SumAsync(d => d.Amount, cancellationToken);
    }

    public async Task<IEnumerable<Debt>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Category)
            .Where(d => d.UserId == userId && d.Date >= startDate && d.Date <= endDate)
            .OrderByDescending(d => d.Date)
            .ToListAsync(cancellationToken);
    }
}
