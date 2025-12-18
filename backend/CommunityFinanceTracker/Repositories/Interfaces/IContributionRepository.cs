using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Repositories.Interfaces;

public interface IContributionRepository : IRepository<Contribution>
{
    Task<IEnumerable<Contribution>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Contribution>> GetByUserIdWithCategoryAsync(int userId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Contribution>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
