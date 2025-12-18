using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Repositories.Interfaces;

public interface IInvitationRepository : IRepository<Invitation>
{
    Task<Invitation?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<IEnumerable<Invitation>> GetValidInvitationsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Invitation>> GetExpiredInvitationsAsync(CancellationToken cancellationToken = default);
}
