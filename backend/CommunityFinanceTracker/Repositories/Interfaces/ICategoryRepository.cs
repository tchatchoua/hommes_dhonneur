using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Repositories.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetByCategoryTypeAsync(CategoryType type, CancellationToken cancellationToken = default);
    Task<Category?> GetByNameAndTypeAsync(string name, CategoryType type, CancellationToken cancellationToken = default);
}
