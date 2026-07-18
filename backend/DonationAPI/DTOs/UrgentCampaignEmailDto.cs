using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class UrgentCampaignEmailDto
    {
        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        // Optional — falls back to a default campaigns URL if not provided
        public string? DonationUrl { get; set; }
    }
}