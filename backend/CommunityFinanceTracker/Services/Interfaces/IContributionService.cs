using CommunityFinanceTracker.Models.DTOs;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface IContributionService
{
    Task<ContributionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ContributionDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ContributionDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ContributionDto>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<ContributionDto> CreateAsync(CreateContributionDto dto, CancellationToken cancellationToken = default);
    Task<ContributionDto?> UpdateAsync(int id, UpdateContributionDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
