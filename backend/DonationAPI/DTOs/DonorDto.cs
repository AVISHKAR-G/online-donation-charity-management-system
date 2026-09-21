using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class DonorListDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal TotalDonated { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class DonorProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateTime? Dob { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime MemberSince { get; set; }
        public decimal TotalDonated { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class DonorChangePasswordDto
    {
        // Normal change: the donor's current password
        [MaxLength(100)]
        public string? CurrentPassword { get; set; }

        // Forgot password: the 6-digit code that was emailed to the donor (used instead of CurrentPassword)
        [MaxLength(10)]
        public string? Code { get; set; }

        [Required, MaxLength(100)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class DonorUpdateDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime? Dob { get; set; }

        [MaxLength(30)]
        public string? Gender { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(10)]
        public string? Pincode { get; set; }

        [MaxLength(700000)]   // ~500 KB image as base64
        public string? ProfilePicture { get; set; }
    }
}