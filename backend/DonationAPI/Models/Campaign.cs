using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum CampaignStatus
    {
        PendingApproval = 0,
        Active = 1,
        Completed = 2,
        Rejected = 3
    }

    public class Campaign
    {
        public int CampaignId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string? Category { get; set; }

        public string? ImageUrl { get; set; }

        [Range(1, double.MaxValue)]
        public decimal TargetAmount { get; set; }

        public decimal CollectedAmount { get; set; } = 0;

        public CampaignStatus Status { get; set; } = CampaignStatus.PendingApproval;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndDate { get; set; }

        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
        public ICollection<Beneficiary> Beneficiaries { get; set; } = new List<Beneficiary>();

        public double PercentageCompleted =>
            TargetAmount <= 0 ? 0 : Math.Round((double)(CollectedAmount / TargetAmount) * 100, 2);
    }
}
