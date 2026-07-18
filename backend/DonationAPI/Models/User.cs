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

        public string? FacebookId { get; set; }

        public UserRole Role { get; set; } = UserRole.Donor;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }
}