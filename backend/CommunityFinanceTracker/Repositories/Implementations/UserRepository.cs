using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Data;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;

namespace CommunityFinanceTracker.Repositories.Implementations;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username != null && u.Username.ToLower() == username.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByExternalAuthIdAsync(string externalAuthId, AuthMethod authMethod, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.ExternalAuthId == externalAuthId && u.AuthMethod == authMethod, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Contributions)
                .ThenInclude(c => c.Category)
            .Include(u => u.Debts)
                .ThenInclude(d => d.Category)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
