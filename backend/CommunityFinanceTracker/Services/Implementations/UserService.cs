using AutoMapper;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IContributionRepository _contributionRepository;
    private readonly IDebtRepository _debtRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IContributionRepository contributionRepository,
        IDebtRepository debtRepository,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _contributionRepository = contributionRepository;
        _debtRepository = debtRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserProfileDto?> GetProfileAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        return user == null ? null : _mapper.Map<UserProfileDto>(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<IEnumerable<UserDto>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetActiveUsersAsync(cancellationToken);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        // Check if email exists
        var existingEmail = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingEmail != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Check if username exists
        if (!string.IsNullOrEmpty(dto.Username))
        {
            var existingUsername = await _userRepository.GetByUsernameAsync(dto.Username, cancellationToken);
            if (existingUsername != null)
            {
                throw new InvalidOperationException("Username already taken");
            }
        }

        var user = _mapper.Map<User>(dto);
        user.AuthMethod = AuthMethod.UsernamePassword;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;

        await _userRepository.AddAsync(user, cancellationToken);

        _logger.LogInformation("User {Email} created by admin", user.Email);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return null;
        }

        // Check email uniqueness if changing
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            var existingEmail = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Email already registered");
            }
        }

        _mapper.Map(dto, user);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        return await UpdateAsync(id, dto, cancellationToken);
    }

    public async Task<bool> UpdateRoleAsync(int id, UpdateUserRoleDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return false;
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
        {
            throw new InvalidOperationException("Invalid role");
        }

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("User {UserId} role updated to {Role}", id, role);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return false;
        }

        await _userRepository.DeleteAsync(user, cancellationToken);

        _logger.LogInformation("User {UserId} deleted", id);

        return true;
    }

    public async Task<bool> DeactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return false;
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("User {UserId} deactivated", id);

        return true;
    }

    public async Task<DashboardDto> GetDashboardAsync(int userId, CancellationToken cancellationToken = default)
    {
        var totalContributions = await _contributionRepository.GetTotalByUserIdAsync(userId, cancellationToken);
        var totalDebts = await _debtRepository.GetTotalByUserIdAsync(userId, cancellationToken);
        var balance = totalContributions - totalDebts;

        var contributions = await _contributionRepository.GetByUserIdWithCategoryAsync(userId, cancellationToken);
        var debts = await _debtRepository.GetByUserIdWithCategoryAsync(userId, cancellationToken);

        var recentContributions = contributions.Take(5).ToList();
        var recentDebts = debts.Take(5).ToList();

        return new DashboardDto
        {
            TotalContributions = totalContributions,
            TotalDebts = totalDebts,
            Balance = balance,
            RecentContributions = _mapper.Map<List<ContributionDto>>(recentContributions),
            RecentDebts = _mapper.Map<List<DebtDto>>(recentDebts)
        };
    }
}
