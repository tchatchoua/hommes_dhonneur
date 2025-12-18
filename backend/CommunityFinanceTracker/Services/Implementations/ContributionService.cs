using AutoMapper;
using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class ContributionService : IContributionService
{
    private readonly IContributionRepository _contributionRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ContributionService> _logger;

    public ContributionService(
        IContributionRepository contributionRepository,
        IUserRepository userRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper,
        ILogger<ContributionService> logger)
    {
        _contributionRepository = contributionRepository;
        _userRepository = userRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ContributionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var contribution = await _contributionRepository.Query()
            .Include(c => c.User)
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        return contribution == null ? null : _mapper.Map<ContributionDto>(contribution);
    }

    public async Task<IEnumerable<ContributionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var contributions = await _contributionRepository.Query()
            .Include(c => c.User)
            .Include(c => c.Category)
            .OrderByDescending(c => c.Date)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<ContributionDto>>(contributions);
    }

    public async Task<IEnumerable<ContributionDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var contributions = await _contributionRepository.GetByUserIdWithCategoryAsync(userId, cancellationToken);
        return _mapper.Map<IEnumerable<ContributionDto>>(contributions);
    }

    public async Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _contributionRepository.GetTotalByUserIdAsync(userId, cancellationToken);
    }

    public async Task<IEnumerable<ContributionDto>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var contributions = await _contributionRepository.GetByDateRangeAsync(userId, startDate, endDate, cancellationToken);
        return _mapper.Map<IEnumerable<ContributionDto>>(contributions);
    }

    public async Task<ContributionDto> CreateAsync(CreateContributionDto dto, CancellationToken cancellationToken = default)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(dto.UserId, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Validate category exists and is a contribution category
        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, cancellationToken);
        if (category == null)
        {
            throw new InvalidOperationException("Category not found");
        }
        if (category.Type != CategoryType.Contribution)
        {
            throw new InvalidOperationException("Invalid category type for contribution");
        }

        var contribution = _mapper.Map<Contribution>(dto);
        contribution.CreatedAt = DateTime.UtcNow;

        await _contributionRepository.AddAsync(contribution, cancellationToken);

        // Reload with navigation properties
        var result = await GetByIdAsync(contribution.Id, cancellationToken);

        _logger.LogInformation("Contribution {ContributionId} created for user {UserId}", contribution.Id, dto.UserId);

        return result!;
    }

    public async Task<ContributionDto?> UpdateAsync(int id, UpdateContributionDto dto, CancellationToken cancellationToken = default)
    {
        var contribution = await _contributionRepository.GetByIdAsync(id, cancellationToken);
        if (contribution == null)
        {
            return null;
        }

        // Validate category if changing
        if (dto.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId.Value, cancellationToken);
            if (category == null)
            {
                throw new InvalidOperationException("Category not found");
            }
            if (category.Type != CategoryType.Contribution)
            {
                throw new InvalidOperationException("Invalid category type for contribution");
            }
        }

        _mapper.Map(dto, contribution);
        contribution.UpdatedAt = DateTime.UtcNow;

        await _contributionRepository.UpdateAsync(contribution, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var contribution = await _contributionRepository.GetByIdAsync(id, cancellationToken);
        if (contribution == null)
        {
            return false;
        }

        await _contributionRepository.DeleteAsync(contribution, cancellationToken);

        _logger.LogInformation("Contribution {ContributionId} deleted", id);

        return true;
    }
}
