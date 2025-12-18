using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using AutoMapper;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;
using CommunityFinanceTracker.Configuration;
using Microsoft.Extensions.Options;

namespace CommunityFinanceTracker.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IInvitationRepository _invitationRepository;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IInvitationRepository invitationRepository,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _invitationRepository = invitationRepository;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.UsernameOrEmail, cancellationToken)
            ?? await _userRepository.GetByUsernameAsync(request.UsernameOrEmail, cancellationToken);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        // Validate invitation token if provided
        if (!string.IsNullOrEmpty(request.InvitationToken))
        {
            var isValid = await ValidateInvitationTokenAsync(request.InvitationToken, cancellationToken);
            if (!isValid)
            {
                throw new InvalidOperationException("Invalid or expired invitation token");
            }
        }

        // Check if email exists
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmail != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Check if username exists
        var existingUsername = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (existingUsername != null)
        {
            throw new InvalidOperationException("Username already taken");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DateOfBirth = request.DateOfBirth,
            AuthMethod = AuthMethod.UsernamePassword,
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        // Mark invitation as used
        if (!string.IsNullOrEmpty(request.InvitationToken))
        {
            var invitation = await _invitationRepository.GetByTokenAsync(request.InvitationToken, cancellationToken);
            if (invitation != null)
            {
                invitation.IsUsed = true;
                invitation.UsedByUserId = user.Id;
                invitation.UsedAt = DateTime.UtcNow;
                await _invitationRepository.UpdateAsync(invitation, cancellationToken);
            }
        }

        _logger.LogInformation("User {Email} registered successfully", user.Email);

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> ExternalAuthAsync(ExternalAuthRequestDto request, CancellationToken cancellationToken = default)
    {
        // Validate external token and get user info
        var (externalId, email, firstName, lastName) = await ValidateExternalTokenAsync(request.Provider, request.AccessToken);

        var authMethod = request.Provider.ToLowerInvariant() switch
        {
            "google" => AuthMethod.Google,
            "facebook" => AuthMethod.Facebook,
            _ => throw new InvalidOperationException("Invalid provider")
        };

        // Check if user exists
        var user = await _userRepository.GetByExternalAuthIdAsync(externalId, authMethod, cancellationToken);

        if (user == null)
        {
            // Check if email is already registered
            user = await _userRepository.GetByEmailAsync(email, cancellationToken);
            
            if (user != null)
            {
                // Link existing account to external provider
                user.ExternalAuthId = externalId;
                user.AuthMethod = authMethod;
                await _userRepository.UpdateAsync(user, cancellationToken);
            }
            else
            {
                // Validate invitation if new user
                if (!string.IsNullOrEmpty(request.InvitationToken))
                {
                    var isValid = await ValidateInvitationTokenAsync(request.InvitationToken, cancellationToken);
                    if (!isValid)
                    {
                        throw new InvalidOperationException("Invalid or expired invitation token");
                    }
                }

                // Create new user
                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    ExternalAuthId = externalId,
                    AuthMethod = authMethod,
                    DateOfBirth = DateTime.MinValue, // Will need to be updated
                    Role = UserRole.User,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(user, cancellationToken);

                // Mark invitation as used
                if (!string.IsNullOrEmpty(request.InvitationToken))
                {
                    var invitation = await _invitationRepository.GetByTokenAsync(request.InvitationToken, cancellationToken);
                    if (invitation != null)
                    {
                        invitation.IsUsed = true;
                        invitation.UsedByUserId = user.Id;
                        invitation.UsedAt = DateTime.UtcNow;
                        await _invitationRepository.UpdateAsync(invitation, cancellationToken);
                    }
                }
            }
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        // In a production app, you'd store refresh tokens in database
        // For simplicity, we'll re-validate and issue a new token
        // This is a placeholder - implement proper refresh token storage
        throw new NotImplementedException("Implement refresh token storage for production use");
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            return false;
        }

        if (user.AuthMethod != AuthMethod.UsernamePassword || string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new InvalidOperationException("Cannot change password for external auth accounts");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return true;
    }

    public async Task<bool> ValidateInvitationTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token, cancellationToken);
        return invitation != null && !invitation.IsUsed && invitation.ExpirationDate > DateTime.UtcNow;
    }

    public string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("auth_method", user.AuthMethod.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private AuthResponseDto GenerateAuthResponse(User user)
    {
        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = _mapper.Map<UserDto>(user)
        };
    }

    private async Task<(string externalId, string email, string firstName, string lastName)> ValidateExternalTokenAsync(
        string provider, string accessToken)
    {
        // In production, you would validate the token with Google/Facebook APIs
        // This is a placeholder implementation
        // For Google: use Google.Apis.Auth library
        // For Facebook: call Facebook Graph API

        throw new NotImplementedException(
            $"External authentication with {provider} requires implementation with actual OAuth provider APIs");
    }
}
