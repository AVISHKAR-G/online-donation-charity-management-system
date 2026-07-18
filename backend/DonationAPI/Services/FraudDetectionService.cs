using DonationAPI.Data;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class FraudDetectionService : IFraudDetectionService
    {
        private readonly AppDbContext _context;

        public FraudDetectionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FraudCheckResult> EvaluateAsync(int userId, int campaignId, decimal amount)
        {
            var result = new FraudCheckResult();

            // Signal 1: amount vs this campaign's average donation size
            var campaignDonations = await _context.Donations
                .Where(d => d.CampaignId == campaignId && d.Status != DonationStatus.Rejected)
                .Select(d => d.Amount)
                .ToListAsync();

            if (campaignDonations.Count >= 3)
            {
                var avg = campaignDonations.Average();
                if (avg > 0 && amount >= avg * 5)
                {
                    result.RiskScore += 40;
                    result.Reasons.Add($"Amount is {Math.Round(amount / avg, 1)}x this campaign's average donation");
                }
            }

            // Signal 2: rapid repeat donations from the same user (last 24h)
            var since = DateTime.UtcNow.AddHours(-24);
            var recentCount = await _context.Donations
                .CountAsync(d => d.UserId == userId && d.Date >= since);

            if (recentCount >= 3)
            {
                result.RiskScore += 35;
                result.Reasons.Add($"{recentCount + 1} donations from this user in the last 24 hours");
            }

            // Signal 3: first-time donor with an unusually large donation
            var userDonationCount = await _context.Donations.CountAsync(d => d.UserId == userId);
            if (userDonationCount == 0 && amount >= 50000)
            {
                result.RiskScore += 30;
                result.Reasons.Add("First-time donor making a large donation");
            }

            if (result.RiskScore > 100) result.RiskScore = 100;

            return result;
        }
    }
}