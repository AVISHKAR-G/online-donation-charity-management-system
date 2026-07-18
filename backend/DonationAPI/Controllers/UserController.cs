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
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users
                .Select(u => new { u.UserId, u.Name, u.Email, u.Phone, Role = u.Role.ToString(), u.IsActive, u.CreatedAt })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();
            return Ok(new { user.UserId, user.Name, user.Email, user.Phone, Role = user.Role.ToString(), user.IsActive, user.CreatedAt });
        }

        [HttpPut("{id}/toggle-active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { user.UserId, user.IsActive });
        }

        [HttpGet("{id}/history")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserHistory(int id)
        {
            var history = await BuildHistoryAsync(id);
            return Ok(history);
        }

        [HttpGet("me/history")]
        public async Task<IActionResult> GetMyHistory()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var history = await BuildHistoryAsync(userId);
            return Ok(history);
        }

        private async Task<UserHistoryDto> BuildHistoryAsync(int userId)
        {
            var donations = await _context.Donations
                .Include(d => d.Campaign)
                .Include(d => d.Payment)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.Date)
                .Select(d => new DonationHistoryItemDto
                {
                    DonationId = d.DonationId,
                    CampaignTitle = d.Campaign != null ? d.Campaign.Title : "",
                    Amount = d.Amount,
                    PaymentMethod = d.Payment != null ? d.Payment.Method.ToString() : "",
                    Status = d.Status.ToString(),
                    Date = d.Date,
                    AdminMessage = d.AdminMessage
                })
                .ToListAsync();

            var applications = await _context.AssistanceApplications
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ApplicationHistoryItemDto
                {
                    ApplicationId = a.ApplicationId,
                    Type = a.Type.ToString(),
                    AmountRequired = a.AmountRequired,
                    Status = a.Status.ToString(),
                    DocumentPath = a.DocumentPath,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            var aidReceived = await _context.AidDeliveries
                .Include(d => d.Application)
                .Where(d => d.Application != null && d.Application.UserId == userId)
                .OrderByDescending(d => d.ScheduledAt)
                .Select(d => new AidDeliveryHistoryItemDto
                {
                    AidDeliveryId = d.AidDeliveryId,
                    ApplicationId = d.ApplicationId,
                    AmountDelivered = d.AmountDelivered,
                    Method = d.Method.ToString(),
                    Status = d.Status.ToString(),
                    Notes = d.Notes,
                    DeliveredAt = d.DeliveredAt
                })
                .ToListAsync();

            return new UserHistoryDto
            {
                Donations = donations,
                Applications = applications,
                AidReceived = aidReceived
            };
        }
    }
}