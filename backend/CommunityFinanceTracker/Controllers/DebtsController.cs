using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DebtsController : ControllerBase
{
    private readonly IDebtService _debtService;
    private readonly ILogger<DebtsController> _logger;

    public DebtsController(
        IDebtService debtService,
        ILogger<DebtsController> logger)
    {
        _debtService = debtService;
        _logger = logger;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    private bool IsAdmin => User.IsInRole("Admin");

    /// <summary>
    /// Get all debts (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DebtDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var debts = await _debtService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<DebtDto>>.SuccessResponse(debts));
    }

    /// <summary>
    /// Get debt by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var debt = await _debtService.GetByIdAsync(id, cancellationToken);
        if (debt == null)
        {
            return NotFound(ApiResponse<DebtDto>.ErrorResponse("Debt not found"));
        }

        // Users can only view their own debts unless admin
        if (debt.UserId != CurrentUserId && !IsAdmin)
        {
            return Forbid();
        }

        return Ok(ApiResponse<DebtDto>.SuccessResponse(debt));
    }

    /// <summary>
    /// Get current user's debts
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DebtDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDebts(CancellationToken cancellationToken)
    {
        var debts = await _debtService.GetByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<DebtDto>>.SuccessResponse(debts));
    }

    /// <summary>
    /// Get debts by user ID (Admin only)
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DebtDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        var debts = await _debtService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<DebtDto>>.SuccessResponse(debts));
    }

    /// <summary>
    /// Get current user's total debts
    /// </summary>
    [HttpGet("me/total")]
    [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTotal(CancellationToken cancellationToken)
    {
        var total = await _debtService.GetTotalByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(ApiResponse<decimal>.SuccessResponse(total));
    }

    /// <summary>
    /// Get debts by date range
    /// </summary>
    [HttpGet("me/range")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DebtDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        var debts = await _debtService.GetByDateRangeAsync(CurrentUserId, startDate, endDate, cancellationToken);
        return Ok(ApiResponse<IEnumerable<DebtDto>>.SuccessResponse(debts));
    }

    /// <summary>
    /// Create a new debt (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateDebtDto request, CancellationToken cancellationToken)
    {
        try
        {
            var debt = await _debtService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = debt.Id }, 
                ApiResponse<DebtDto>.SuccessResponse(debt, "Debt created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<DebtDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Update a debt (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DebtDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDebtDto request, CancellationToken cancellationToken)
    {
        try
        {
            var debt = await _debtService.UpdateAsync(id, request, cancellationToken);
            if (debt == null)
            {
                return NotFound(ApiResponse<DebtDto>.ErrorResponse("Debt not found"));
            }

            return Ok(ApiResponse<DebtDto>.SuccessResponse(debt, "Debt updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<DebtDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Delete a debt (Admin only)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _debtService.DeleteAsync(id, cancellationToken);
        if (!result)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse("Debt not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Debt deleted successfully"));
    }
}
