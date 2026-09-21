using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class UrgentCampaignService : IUrgentCampaignService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<UrgentCampaignService> _logger;

        public UrgentCampaignService(AppDbContext context, IEmailService emailService, ILogger<UrgentCampaignService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<UrgentCampaignResultDto> SendToAllDonorsAsync(SendUrgentCampaignDto dto)
        {
            // Debug: see raw counts before any filtering
            var totalUsers = await _context.Users.CountAsync();
            var totalActiveUsers = await _context.Users.CountAsync(u => u.IsActive);
            var totalDonations = await _context.Donations.CountAsync();
            _logger.LogInformation("DEBUG: TotalUsers={TotalUsers}, ActiveUsers={ActiveUsers}, TotalDonations={TotalDonations}",
                totalUsers, totalActiveUsers, totalDonations);

            var donors = await _context.Users
                .Where(u => u.IsActive && u.Donations.Any())
                .Select(u => new { u.Email, u.Name })
                .Distinct()
                .ToListAsync();

            _logger.LogInformation("DEBUG: Donors found by main query = {Count}", donors.Count);

            var bodyHtml = BuildEmailBody(dto.Subject, dto.Message);
            var sentCount = await _emailService.SendBulkAsync(
                donors.Select(d => (d.Email, d.Name)), dto.Subject, bodyHtml);

            var previouslyActive = await _context.UrgentCampaigns.Where(c => c.IsActive).ToListAsync();
            foreach (var c in previouslyActive) c.IsActive = false;

            var campaign = new UrgentCampaign
            {
                Subject = dto.Subject,
                Message = dto.Message,
                RecipientCount = sentCount,
                IsActive = true,
            };
            _context.UrgentCampaigns.Add(campaign);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Urgent campaign '{Subject}' sent to {Sent}/{Total} past donors.", dto.Subject, sentCount, donors.Count);

            return new UrgentCampaignResultDto
            {
                UrgentCampaignId = campaign.UrgentCampaignId,
                Subject = campaign.Subject,
                RecipientCount = campaign.RecipientCount,
                SentAt = campaign.SentAt,
            };
        }

        public async Task SendActiveCampaignToNewUserAsync(User newUser)
        {
            var active = await _context.UrgentCampaigns
                .Where(c => c.IsActive)
                .OrderByDescending(c => c.SentAt)
                .FirstOrDefaultAsync();

            if (active is null) return;

            var bodyHtml = BuildEmailBody(active.Subject, active.Message);
            await _emailService.SendAsync(newUser.Email, newUser.Name, active.Subject, bodyHtml);
        }

        private static string BuildEmailBody(string subject, string message)
        {
            var paragraphs = string.Join("", message
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(p => $"<p style=\"margin:0 0 14px;line-height:1.5;\">{System.Net.WebUtility.HtmlEncode(p.Trim())}</p>"));

            return $@"
<div style=""font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;"">
  <h2 style=""color:#dc2626;margin:0 0 16px;"">{System.Net.WebUtility.HtmlEncode(subject)}</h2>
  {paragraphs}
</div>";
        }
    }
}