using System.Security.Claims;
using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/settings")] // matches the /api/ prefix used by every other controller in this app
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        private bool TryGetUserId(out int userId)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out userId);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotificationPreferences()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var prefs = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                // No saved row yet -> return defaults (nothing persisted until the user hits Save)
                return Ok(new Notificationpreferencesdto
                {
                    EmailAlerts = true,
                    DonorSignups = true,
                    CampaignMilestones = true,
                    WeeklyDigest = false
                });
            }

            return Ok(new Notificationpreferencesdto
            {
                EmailAlerts = prefs.EmailAlerts,
                DonorSignups = prefs.DonorSignups,
                CampaignMilestones = prefs.CampaignMilestones,
                WeeklyDigest = prefs.WeeklyDigest
            });
        }

        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotificationPreferences([FromBody] Notificationpreferencesdto dto)
        {
            if (dto == null)
            {
                return BadRequest("Notification preferences payload is required.");
            }

            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var prefs = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                prefs = new NotificationPreferences { UserId = userId };
                _context.NotificationPreferences.Add(prefs);
            }

            prefs.EmailAlerts = dto.EmailAlerts;
            prefs.DonorSignups = dto.DonorSignups;
            prefs.CampaignMilestones = dto.CampaignMilestones;
            prefs.WeeklyDigest = dto.WeeklyDigest;

            await _context.SaveChangesAsync();

            return Ok(dto);
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                return BadRequest(new { message = "Current and new password are required." });
            }

            if (dto.NewPassword.Length < 8)
            {
                return BadRequest(new { message = "New password must be at least 8 characters." });
            }

            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return Unauthorized();
            }

            // OAuth-only accounts (Google/Facebook) have no password set yet
            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }
    }
}