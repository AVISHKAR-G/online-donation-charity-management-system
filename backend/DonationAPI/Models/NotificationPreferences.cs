namespace DonationAPI.Models
{
    public class NotificationPreferences
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public bool EmailAlerts { get; set; } = true;
        public bool DonorSignups { get; set; } = true;
        public bool CampaignMilestones { get; set; } = true;
        public bool WeeklyDigest { get; set; } = false;
    }
}