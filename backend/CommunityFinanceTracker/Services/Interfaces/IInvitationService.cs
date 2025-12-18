using CommunityFinanceTracker.Models.DTOs;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface IInvitationService
{
    Task<InvitationDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<InvitationDto?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<IEnumerable<InvitationDto>> GetValidInvitationsAsync(CancellationToken cancellationToken = default);
    Task<InvitationDto> CreateAsync(int createdByUserId, CreateInvitationDto dto, string baseUrl, CancellationToken cancellationToken = default);
    Task<bool> UseInvitationAsync(string token, int userId, CancellationToken cancellationToken = default);
    Task<bool> IsValidAsync(string token, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task CleanupExpiredAsync(CancellationToken cancellationToken = default);
}
