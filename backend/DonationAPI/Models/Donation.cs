using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum DonationStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class Donation
    {
        public int DonationId { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public int CampaignId { get; set; }
        public Campaign? Campaign { get; set; }

        [Range(1, double.MaxValue)]
        public decimal Amount { get; set; }

        public int? PaymentId { get; set; }
        public Payment? Payment { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public bool IsAnonymous { get; set; } = false;

        public Receipt? Receipt { get; set; }

        public DonationStatus Status { get; set; } = DonationStatus.Pending;

        public string? AdminMessage { get; set; }

        // --- Fraud detection fields ---
        public int RiskScore { get; set; } = 0;
        public string? RiskFlags { get; set; }
        public bool IsFlaggedForReview { get; set; } = false;
    }
}