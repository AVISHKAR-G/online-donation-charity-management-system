using System.ComponentModel.DataAnnotations;
using DonationAPI.Models;

namespace DonationAPI.DTOs
{
    public class BeneficiaryResponseDto
    {
        public int BeneficiaryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public int CampaignId { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public decimal AllocatedAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBeneficiaryDto
    {
        [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
        [Required] public string Purpose { get; set; } = string.Empty;
        [Required] public int CampaignId { get; set; }
        [Range(1, double.MaxValue)] public decimal AllocatedAmount { get; set; }
    }

    public class UpdateBeneficiaryStatusDto
    {
        [Required] public BeneficiaryStatus Status { get; set; }
    }
}