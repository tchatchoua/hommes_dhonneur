using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Repositories.Interfaces;

public interface IDebtRepository : IRepository<Debt>
{
    Task<IEnumerable<Debt>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Debt>> GetByUserIdWithCategoryAsync(int userId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Debt>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
