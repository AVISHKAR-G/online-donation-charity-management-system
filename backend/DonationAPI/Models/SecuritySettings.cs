using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonationAPI.Models
{
    public class SecuritySettings
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        public bool TwoFactorEnabled { get; set; } = false;
        public bool LoginAlertsEnabled { get; set; } = true;
    }
}