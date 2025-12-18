using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Category>> GetByCategoryTypeAsync(CategoryType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.Type == type && c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByNameAndTypeAsync(string name, CategoryType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower() && c.Type == type, cancellationToken);
    }
}
