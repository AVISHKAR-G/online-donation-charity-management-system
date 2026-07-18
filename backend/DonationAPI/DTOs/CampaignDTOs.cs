using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class CampaignCreateDto
    {
        [Required] public string Title { get; set; } = string.Empty;
        [Required] public string Description { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? ImageUrl { get; set; }
        [Range(1, double.MaxValue)] public decimal TargetAmount { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class CampaignUpdateDto : CampaignCreateDto
    {
        public int Status { get; set; }
    }

    public class CampaignResponseDto
    {
        public int CampaignId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? ImageUrl { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal CollectedAmount { get; set; }
        public double PercentageCompleted { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class CampaignTransparencyDto
    {
        public int CampaignId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal TotalCollected { get; set; }
        public decimal AmountUsed { get; set; }
        public decimal RemainingBalance { get; set; }
        public int BeneficiariesHelped { get; set; }
        public double ProgressPercent { get; set; }
    }
}
