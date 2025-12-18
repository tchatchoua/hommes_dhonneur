using AutoMapper;
using Microsoft.EntityFrameworkCore;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class DebtService : IDebtService
{
    private readonly IDebtRepository _debtRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<DebtService> _logger;

    public DebtService(
        IDebtRepository debtRepository,
        IUserRepository userRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper,
        ILogger<DebtService> logger)
    {
        _debtRepository = debtRepository;
        _userRepository = userRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<DebtDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var debt = await _debtRepository.Query()
            .Include(d => d.User)
            .Include(d => d.Category)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        return debt == null ? null : _mapper.Map<DebtDto>(debt);
    }

    public async Task<IEnumerable<DebtDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var debts = await _debtRepository.Query()
            .Include(d => d.User)
            .Include(d => d.Category)
            .OrderByDescending(d => d.Date)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<DebtDto>>(debts);
    }

    public async Task<IEnumerable<DebtDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var debts = await _debtRepository.GetByUserIdWithCategoryAsync(userId, cancellationToken);
        return _mapper.Map<IEnumerable<DebtDto>>(debts);
    }

    public async Task<decimal> GetTotalByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _debtRepository.GetTotalByUserIdAsync(userId, cancellationToken);
    }

    public async Task<IEnumerable<DebtDto>> GetByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var debts = await _debtRepository.GetByDateRangeAsync(userId, startDate, endDate, cancellationToken);
        return _mapper.Map<IEnumerable<DebtDto>>(debts);
    }

    public async Task<DebtDto> CreateAsync(CreateDebtDto dto, CancellationToken cancellationToken = default)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(dto.UserId, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Validate category exists and is a debt category
        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, cancellationToken);
        if (category == null)
        {
            throw new InvalidOperationException("Category not found");
        }
        if (category.Type != CategoryType.Debt)
        {
            throw new InvalidOperationException("Invalid category type for debt");
        }

        var debt = _mapper.Map<Debt>(dto);
        debt.CreatedAt = DateTime.UtcNow;

        await _debtRepository.AddAsync(debt, cancellationToken);

        // Reload with navigation properties
        var result = await GetByIdAsync(debt.Id, cancellationToken);

        _logger.LogInformation("Debt {DebtId} created for user {UserId}", debt.Id, dto.UserId);

        return result!;
    }

    public async Task<DebtDto?> UpdateAsync(int id, UpdateDebtDto dto, CancellationToken cancellationToken = default)
    {
        var debt = await _debtRepository.GetByIdAsync(id, cancellationToken);
        if (debt == null)
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
            if (category.Type != CategoryType.Debt)
            {
                throw new InvalidOperationException("Invalid category type for debt");
            }
        }

        _mapper.Map(dto, debt);
        debt.UpdatedAt = DateTime.UtcNow;

        await _debtRepository.UpdateAsync(debt, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var debt = await _debtRepository.GetByIdAsync(id, cancellationToken);
        if (debt == null)
        {
            return false;
        }

        await _debtRepository.DeleteAsync(debt, cancellationToken);

        _logger.LogInformation("Debt {DebtId} deleted", id);

        return true;
    }
}
