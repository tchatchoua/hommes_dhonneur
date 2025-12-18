using CommunityFinanceTracker.Models.DTOs;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface IDebtService
{
    Task<DebtDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<DebtDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DebtDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DebtDto>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<DebtDto> CreateAsync(CreateDebtDto dto, CancellationToken cancellationToken = default);
    Task<DebtDto?> UpdateAsync(int id, UpdateDebtDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
