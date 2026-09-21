using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum BeneficiaryStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Completed = 3,
        FundsDisbursed = 4
    }

    public enum Region
    {
        North = 0,
        South = 1,
        East = 2,
        West = 3,
        Central = 4
    }

    public class Beneficiary
    {
        public int BeneficiaryId { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Purpose { get; set; } = string.Empty;

        public int CampaignId { get; set; }
        public Campaign? Campaign { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        public string? Address { get; set; }

        public Region Region { get; set; } = Region.North;

        [MaxLength(100)]
        public string? State { get; set; }

        [Range(0, double.MaxValue)]
        public decimal AllocatedAmount { get; set; }

        public BeneficiaryStatus Status { get; set; } = BeneficiaryStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Links this Beneficiary back to the AssistanceApplication it originated from
        public int? ApplicationId { get; set; }
        public AssistanceApplication? Application { get; set; }
    }
}