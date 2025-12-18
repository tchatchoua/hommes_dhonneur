using CommunityFinanceTracker.Models.DTOs;

namespace CommunityFinanceTracker.Services.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserProfileDto?> GetProfileAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<UserDto>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserDto?> UpdateProfileAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateRoleAsync(int id, UpdateUserRoleDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> DeactivateAsync(int id, CancellationToken cancellationToken = default);
    Task<DashboardDto> GetDashboardAsync(int userId, CancellationToken cancellationToken = default);
}
