using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonationAPI.Models
{
    public class EmailPreferences
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        public bool DonorReceipts { get; set; } = true;
        public bool MonthlyReports { get; set; } = true;
        public bool ProductUpdates { get; set; } = false;
    }
}