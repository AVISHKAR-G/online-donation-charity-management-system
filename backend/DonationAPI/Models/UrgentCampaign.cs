using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public class UrgentCampaign
    {
        public int UrgentCampaignId { get; set; }

        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public int RecipientCount { get; set; }

        // Only one urgent campaign is "active" at a time. The active one is the
        // message that gets auto-emailed to every new user right after they register.
        public bool IsActive { get; set; } = true;
    }
}