using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class ContactMessageCreateDto
    {
        [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
        [Required, EmailAddress, MaxLength(150)] public string Email { get; set; } = string.Empty;
        [MaxLength(20)] public string? Phone { get; set; }
        [MaxLength(150)] public string? Organization { get; set; }
        [MaxLength(50)] public string RequestFor { get; set; } = "General Inquiry";
        [Required] public string Message { get; set; } = string.Empty;
    }

    public class ContactMessageResponseDto
    {
        public int ContactMessageId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string RequestFor { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}