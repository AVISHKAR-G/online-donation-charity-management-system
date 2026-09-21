using System.Security.Claims;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;

        public ActivityLogController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        // GET /api/activitylog
        [HttpGet]
        public async Task<IActionResult> GetRecent()
        {
            // NOTE: assumes the JWT's NameIdentifier claim holds the numeric UserId,
            // matching the pattern your other authenticated controllers likely use.
            // If your token uses a different claim name, adjust this line.
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var logs = await _activityLogService.GetRecentAsync(userId);

            var result = logs.Select(l => new
            {
                l.ActivityLogId,
                l.Action,
                l.Description,
                l.Context,
                l.CreatedAt,
            });

            return Ok(result);
        }
    }
}