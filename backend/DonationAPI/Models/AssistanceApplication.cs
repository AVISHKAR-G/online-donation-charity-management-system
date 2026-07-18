using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum AssistanceType
    {
        Medical = 0,
        Education = 1,
        Food = 2,
        DisasterRelief = 3
    }

    public enum ApplicationStatus
    {
        Pending = 0,
        UnderVerification = 1,
        Approved = 2,
        Rejected = 3,
        FundAllocated = 4
    }

    public class AssistanceApplication
    {
	[Key]
        public int ApplicationId { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public AssistanceType Type { get; set; }

        [Range(1, double.MaxValue)]
        public decimal AmountRequired { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;

        public string? DocumentPath { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}