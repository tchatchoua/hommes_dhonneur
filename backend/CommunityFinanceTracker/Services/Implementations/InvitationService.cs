using System.Security.Cryptography;
using AutoMapper;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<InvitationService> _logger;

    public InvitationService(
        IInvitationRepository invitationRepository,
        IMapper mapper,
        ILogger<InvitationService> logger)
    {
        _invitationRepository = invitationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<InvitationDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByIdAsync(id, cancellationToken);
        return invitation == null ? null : MapToDto(invitation, string.Empty);
    }

    public async Task<InvitationDto?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token, cancellationToken);
        return invitation == null ? null : MapToDto(invitation, string.Empty);
    }

    public async Task<IEnumerable<InvitationDto>> GetValidInvitationsAsync(CancellationToken cancellationToken = default)
    {
        var invitations = await _invitationRepository.GetValidInvitationsAsync(cancellationToken);
        return invitations.Select(i => MapToDto(i, string.Empty));
    }

    public async Task<InvitationDto> CreateAsync(int createdByUserId, CreateInvitationDto dto, string baseUrl, CancellationToken cancellationToken = default)
    {
        var token = GenerateToken();
        var expirationDate = DateTime.UtcNow.AddDays(dto.ExpirationDays);

        var invitation = new Invitation
        {
            Token = token,
            ExpirationDate = expirationDate,
            CreatedByUserId = createdByUserId,
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _invitationRepository.AddAsync(invitation, cancellationToken);

        _logger.LogInformation("Invitation created by user {UserId}, expires {ExpirationDate}", createdByUserId, expirationDate);

        return MapToDto(invitation, baseUrl);
    }

    public async Task<bool> UseInvitationAsync(string token, int userId, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token, cancellationToken);
        if (invitation == null || invitation.IsUsed || invitation.ExpirationDate <= DateTime.UtcNow)
        {
            return false;
        }

        invitation.IsUsed = true;
        invitation.UsedByUserId = userId;
        invitation.UsedAt = DateTime.UtcNow;

        await _invitationRepository.UpdateAsync(invitation, cancellationToken);

        return true;
    }

    public async Task<bool> IsValidAsync(string token, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token, cancellationToken);
        return invitation != null && !invitation.IsUsed && invitation.ExpirationDate > DateTime.UtcNow;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByIdAsync(id, cancellationToken);
        if (invitation == null)
        {
            return false;
        }

        await _invitationRepository.DeleteAsync(invitation, cancellationToken);
        _logger.LogInformation("Deleted invitation {InvitationId}", id);
        return true;
    }

    public async Task CleanupExpiredAsync(CancellationToken cancellationToken = default)
    {
        var expiredInvitations = await _invitationRepository.GetExpiredInvitationsAsync(cancellationToken);
        foreach (var invitation in expiredInvitations)
        {
            await _invitationRepository.DeleteAsync(invitation, cancellationToken);
        }

        _logger.LogInformation("Cleaned up {Count} expired invitations", expiredInvitations.Count());
    }

    private static string GenerateToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private InvitationDto MapToDto(Invitation invitation, string baseUrl)
    {
        var invitationUrl = string.IsNullOrEmpty(baseUrl)
            ? $"/register?token={invitation.Token}"
            : $"{baseUrl.TrimEnd('/')}/register?token={invitation.Token}";

        return new InvitationDto
        {
            Id = invitation.Id,
            Token = invitation.Token,
            InvitationUrl = invitationUrl,
            ExpirationDate = invitation.ExpirationDate,
            IsUsed = invitation.IsUsed,
            CreatedAt = invitation.CreatedAt
        };
    }
}
