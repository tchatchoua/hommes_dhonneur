using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;
    private readonly ILogger<InvitationsController> _logger;

    public InvitationsController(
        IInvitationService invitationService,
        ILogger<InvitationsController> logger)
    {
        _invitationService = invitationService;
        _logger = logger;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    /// <summary>
    /// Get all valid invitations
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<InvitationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var invitations = await _invitationService.GetValidInvitationsAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<InvitationDto>>.SuccessResponse(invitations));
    }

    /// <summary>
    /// Get invitation by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<InvitationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<InvitationDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var invitation = await _invitationService.GetByIdAsync(id, cancellationToken);
        if (invitation == null)
        {
            return NotFound(ApiResponse<InvitationDto>.ErrorResponse("Invitation not found"));
        }

        return Ok(ApiResponse<InvitationDto>.SuccessResponse(invitation));
    }

    /// <summary>
    /// Validate invitation token (Public)
    /// </summary>
    [HttpGet("validate/{token}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Validate(string token, CancellationToken cancellationToken)
    {
        var isValid = await _invitationService.IsValidAsync(token, cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(isValid, isValid ? "Token is valid" : "Token is invalid or expired"));
    }

    /// <summary>
    /// Create a new invitation
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<InvitationDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateInvitationDto request, CancellationToken cancellationToken)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var invitation = await _invitationService.CreateAsync(CurrentUserId, request, baseUrl, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = invitation.Id }, 
            ApiResponse<InvitationDto>.SuccessResponse(invitation, "Invitation created successfully"));
    }

    /// <summary>
    /// Cleanup expired invitations
    /// </summary>
    [HttpPost("cleanup")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cleanup(CancellationToken cancellationToken)
    {
        await _invitationService.CleanupExpiredAsync(cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Expired invitations cleaned up"));
    }

    /// <summary>
    /// Delete an invitation
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _invitationService.DeleteAsync(id, cancellationToken);
        if (!result)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse("Invitation not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Invitation deleted successfully"));
    }
}
