using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> ExternalAuthAsync(ExternalAuthRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request, CancellationToken cancellationToken = default);
    Task<bool> ValidateInvitationTokenAsync(string token, CancellationToken cancellationToken = default);
    string GenerateJwtToken(User user);
    string GenerateRefreshToken();
}
