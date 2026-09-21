using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class SendUrgentCampaignDto
    {
        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;
    }

    public class UrgentCampaignResultDto
    {
        public int UrgentCampaignId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public int RecipientCount { get; set; }
        public DateTime SentAt { get; set; }
    }
}