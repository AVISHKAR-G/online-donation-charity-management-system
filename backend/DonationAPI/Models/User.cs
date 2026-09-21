using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum UserRole
    {
        Donor = 0,
        Admin = 1,
        Volunteer = 2
    }

    public class User
    {
        public int UserId { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        // Nullable now — OAuth-only users (Google/Facebook) never set a password
        public string? PasswordHash { get; set; }

        public string? Phone { get; set; }

        public string? GoogleId { get; set; }

        public DateTime? LastDonationReminderSentAt { get; set; }
        public string? FacebookId { get; set; }

        public UserRole Role { get; set; } = UserRole.Donor;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // ---- Birthday emails ----
        public DateTime? DateOfBirth { get; set; }
        public int? LastBirthdayEmailYear { get; set; }

        // ---- Profile details (Edit Profile page) ----
        [MaxLength(30)] public string? Gender { get; set; }
        [MaxLength(300)] public string? Address { get; set; }
        [MaxLength(100)] public string? City { get; set; }
        [MaxLength(100)] public string? State { get; set; }
        [MaxLength(10)] public string? Pincode { get; set; }

        // Profile photo as a data URL (the website sends a 400x400 JPEG, roughly 50 KB)
        public string? ProfilePicture { get; set; }

        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }
}