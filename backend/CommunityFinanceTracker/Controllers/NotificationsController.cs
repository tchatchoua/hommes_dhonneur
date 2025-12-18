using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CommunityFinanceTracker.Models.DTOs;
using CommunityFinanceTracker.Services.Interfaces;

namespace CommunityFinanceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    /// <summary>
    /// Get current user's notifications
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications(CancellationToken cancellationToken)
    {
        var notifications = await _notificationService.GetByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResponse(notifications));
    }

    /// <summary>
    /// Get notification settings (Admin only)
    /// </summary>
    [HttpGet("settings")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<NotificationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var settings = await _notificationService.GetSettingsAsync(cancellationToken);
        return Ok(ApiResponse<NotificationSettingsDto>.SuccessResponse(settings));
    }

    /// <summary>
    /// Update notification settings (Admin only)
    /// </summary>
    [HttpPut("settings")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<NotificationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateNotificationSettingsDto request, CancellationToken cancellationToken)
    {
        var settings = await _notificationService.UpdateSettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<NotificationSettingsDto>.SuccessResponse(settings, "Settings updated successfully"));
    }

    /// <summary>
    /// Get next notification date
    /// </summary>
    [HttpGet("next-date")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DateTime>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNextNotificationDate(CancellationToken cancellationToken)
    {
        var nextDate = await _notificationService.GetNextNotificationDateAsync(cancellationToken);
        return Ok(ApiResponse<DateTime>.SuccessResponse(nextDate));
    }

    /// <summary>
    /// Manually trigger balance notifications (Admin only)
    /// </summary>
    [HttpPost("trigger-balance")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TriggerBalanceNotifications(CancellationToken cancellationToken)
    {
        await _notificationService.CreateBalanceNotificationsAsync(cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Balance notifications created"));
    }

    /// <summary>
    /// Send pending notifications (Admin only)
    /// </summary>
    [HttpPost("send-pending")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendPendingNotifications(CancellationToken cancellationToken)
    {
        await _notificationService.SendPendingNotificationsAsync(cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Pending notifications sent"));
    }
}
