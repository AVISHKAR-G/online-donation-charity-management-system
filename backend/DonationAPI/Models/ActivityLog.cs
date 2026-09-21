using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public class ActivityLog
    {
        public int ActivityLogId { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        // Short machine-friendly action key, e.g. "PasswordChanged", "LoginSuccess", "SecuritySettingsUpdated"
        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        // Human-readable description shown in the UI, e.g. "Changed account password"
        [Required, MaxLength(300)]
        public string Description { get; set; } = string.Empty;

        // Optional context, e.g. IP address or device info, if you want to capture it later
        [MaxLength(200)]
        public string? Context { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}