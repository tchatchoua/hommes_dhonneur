using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContributionsController : ControllerBase
{
    private readonly IContributionService _contributionService;
    private readonly ILogger<ContributionsController> _logger;

    public ContributionsController(
        IContributionService contributionService,
        ILogger<ContributionsController> logger)
    {
        _contributionService = contributionService;
        _logger = logger;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    private bool IsAdmin => User.IsInRole("Admin");

    /// <summary>
    /// Get all contributions (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContributionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var contributions = await _contributionService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributions));
    }

    /// <summary>
    /// Get contribution by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var contribution = await _contributionService.GetByIdAsync(id, cancellationToken);
        if (contribution == null)
        {
            return NotFound(ApiResponse<ContributionDto>.ErrorResponse("Contribution not found"));
        }

        // Users can only view their own contributions unless admin
        if (contribution.UserId != CurrentUserId && !IsAdmin)
        {
            return Forbid();
        }

        return Ok(ApiResponse<ContributionDto>.SuccessResponse(contribution));
    }

    /// <summary>
    /// Get current user's contributions
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContributionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyContributions(CancellationToken cancellationToken)
    {
        var contributions = await _contributionService.GetByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributions));
    }

    /// <summary>
    /// Get contributions by user ID (Admin only)
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContributionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        var contributions = await _contributionService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributions));
    }

    /// <summary>
    /// Get current user's total contributions
    /// </summary>
    [HttpGet("me/total")]
    [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTotal(CancellationToken cancellationToken)
    {
        var total = await _contributionService.GetTotalByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(ApiResponse<decimal>.SuccessResponse(total));
    }

    /// <summary>
    /// Get contributions by date range
    /// </summary>
    [HttpGet("me/range")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContributionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var contributions = await _contributionService.GetByDateRangeAsync(CurrentUserId, startDate, endDate, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributions));
    }

    /// <summary>
    /// Create a new contribution (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateContributionDto request, CancellationToken cancellationToken)
    {
        try
        {
            var contribution = await _contributionService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = contribution.Id }, 
                ApiResponse<ContributionDto>.SuccessResponse(contribution, "Contribution created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ContributionDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Update a contribution (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ContributionDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateContributionDto request, CancellationToken cancellationToken)
    {
        try
        {
            var contribution = await _contributionService.UpdateAsync(id, request, cancellationToken);
            if (contribution == null)
            {
                return NotFound(ApiResponse<ContributionDto>.ErrorResponse("Contribution not found"));
            }

            return Ok(ApiResponse<ContributionDto>.SuccessResponse(contribution, "Contribution updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ContributionDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Delete a contribution (Admin only)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _contributionService.DeleteAsync(id, cancellationToken);
        if (!result)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse("Contribution not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Contribution deleted successfully"));
    }
}
