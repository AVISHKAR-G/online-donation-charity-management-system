using DonationAPI.Models;

namespace DonationAPI.Services
{
    public class FraudCheckResult
    {
        public int RiskScore { get; set; }
        public List<string> Reasons { get; set; } = new();
        public bool IsFlagged => RiskScore >= 50;
    }

    public interface IFraudDetectionService
    {
        Task<FraudCheckResult> EvaluateAsync(int userId, int campaignId, decimal amount);
    }
}