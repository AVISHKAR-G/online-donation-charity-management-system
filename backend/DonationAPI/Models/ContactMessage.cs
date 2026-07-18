using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public class ContactMessage
    {
        public int ContactMessageId { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Organization { get; set; }

        [MaxLength(50)]
        public string RequestFor { get; set; } = "General Inquiry";

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}