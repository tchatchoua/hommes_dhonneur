namespace CommunityFinanceTracker.Models.DTOs;

// User DTOs
public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? NextOfKin { get; set; }
    public List<string>? ChildrenNames { get; set; }
    public string? SpouseName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public string AuthMethod { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? NextOfKin { get; set; }
    public List<string>? ChildrenNames { get; set; }
    public string? SpouseName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
}

public record CreateUserDto(
    string FirstName,
    string LastName,
    string Email,
    string? Username,
    string? Password,
    DateTime DateOfBirth,
    string? PhoneNumber = null,
    string? Address = null,
    string? NextOfKin = null,
    List<string>? ChildrenNames = null,
    string? SpouseName = null,
    string Role = "User"
);

public record UpdateUserDto(
    string? FirstName,
    string? LastName,
    string? Email,
    string? PhoneNumber,
    string? Address,
    string? NextOfKin,
    List<string>? ChildrenNames,
    string? SpouseName,
    DateTime? DateOfBirth,
    string? PhotoUrl
);

public record UpdateUserRoleDto(string Role);

// Dashboard DTO
public class DashboardDto
{
    public decimal TotalContributions { get; set; }
    public decimal TotalDebts { get; set; }
    public decimal Balance { get; set; }
    public List<ContributionDto> RecentContributions { get; set; } = new();
    public List<DebtDto> RecentDebts { get; set; } = new();
}

// Contribution DTOs
public class ContributionDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record CreateContributionDto(
    int UserId,
    decimal Amount,
    int CategoryId,
    DateTime Date,
    string? Description = null
);

public record UpdateContributionDto(
    decimal? Amount,
    int? CategoryId,
    DateTime? Date,
    string? Description
);

// Debt DTOs
public class DebtDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record CreateDebtDto(
    int UserId,
    decimal Amount,
    int CategoryId,
    DateTime Date,
    DateTime? DueDate = null,
    string? Description = null
);

public record UpdateDebtDto(
    decimal? Amount,
    int? CategoryId,
    DateTime? Date,
    DateTime? DueDate,
    string? Status,
    string? Description
);

// Category DTOs
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public record CreateCategoryDto(
    string Name,
    string Type,
    string? Description = null
);

public record UpdateCategoryDto(
    string? Name,
    string? Description,
    bool? IsActive
);

// Invitation DTOs
public class InvitationDto
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string InvitationUrl { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record CreateInvitationDto(
    int ExpirationDays = 7
);

// Notification DTOs
public class NotificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime NotificationDate { get; set; }
    public bool IsSent { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class NotificationSettingsDto
{
    public int? DayOfMonth { get; set; }
    public string? DayOfWeek { get; set; }
    public int WeekOfMonth { get; set; }
    public int Hour { get; set; }
    public bool IsEnabled { get; set; }
}

public record UpdateNotificationSettingsDto(
    int? DayOfMonth,
    string? DayOfWeek,
    int? WeekOfMonth,
    int? Hour,
    bool? IsEnabled
);
