namespace CommunityFinanceTracker.Models.DTOs;

// Authentication DTOs
public record LoginRequestDto(
    string UsernameOrEmail,
    string Password
);

public record RegisterRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string Username,
    string Password,
    DateTime DateOfBirth,
    string? InvitationToken = null
);

public record ExternalAuthRequestDto(
    string Provider,
    string AccessToken,
    string? InvitationToken = null
);

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = new();
}

public record RefreshTokenRequestDto(
    string RefreshToken
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);

public record ResetPasswordRequestDto(
    string Email
);

public record ResetPasswordDto(
    string Token,
    string NewPassword
);
