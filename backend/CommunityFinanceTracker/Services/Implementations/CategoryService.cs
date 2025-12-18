using AutoMapper;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Models.Entities;
using CommunityFinanceTracker.Repositories.Interfaces;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository categoryRepository,
        IMapper mapper,
        ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<IEnumerable<CategoryDto>> GetByTypeAsync(string type, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CategoryType>(type, true, out var categoryType))
        {
            throw new InvalidOperationException("Invalid category type");
        }

        var categories = await _categoryRepository.GetByCategoryTypeAsync(categoryType, cancellationToken);
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CategoryType>(dto.Type, true, out var categoryType))
        {
            throw new InvalidOperationException("Invalid category type");
        }

        // Check for duplicate
        var existing = await _categoryRepository.GetByNameAndTypeAsync(dto.Name, categoryType, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException("Category with this name and type already exists");
        }

        var category = _mapper.Map<Category>(dto);
        category.CreatedAt = DateTime.UtcNow;
        category.IsActive = true;

        await _categoryRepository.AddAsync(category, cancellationToken);

        _logger.LogInformation("Category {CategoryName} created", category.Name);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return null;
        }

        // Check for duplicate if name is changing
        if (!string.IsNullOrEmpty(dto.Name) && dto.Name != category.Name)
        {
            var existing = await _categoryRepository.GetByNameAndTypeAsync(dto.Name, category.Type, cancellationToken);
            if (existing != null)
            {
                throw new InvalidOperationException("Category with this name and type already exists");
            }
        }

        _mapper.Map(dto, category);

        await _categoryRepository.UpdateAsync(category, cancellationToken);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return false;
        }

        // Soft delete by deactivating
        category.IsActive = false;
        await _categoryRepository.UpdateAsync(category, cancellationToken);

        _logger.LogInformation("Category {CategoryId} deactivated", id);

        return true;
    }
}
