using System.Security.Claims;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetMy() => Ok(await _service.GetMyNotificationsAsync(CurrentUserId));

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount() => Ok(new { count = await _service.GetUnreadCountAsync(CurrentUserId) });

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _service.MarkAsReadAsync(id, CurrentUserId);
            return NoContent();
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            await _service.MarkAllAsReadAsync(CurrentUserId);
            return NoContent();
        }
    }
}