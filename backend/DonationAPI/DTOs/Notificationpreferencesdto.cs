namespace DonationAPI.DTOs
{
    public class Notificationpreferencesdto
    {
        public bool EmailAlerts { get; set; }
        public bool DonorSignups { get; set; }
        public bool CampaignMilestones { get; set; }
        public bool WeeklyDigest { get; set; }
    }
}