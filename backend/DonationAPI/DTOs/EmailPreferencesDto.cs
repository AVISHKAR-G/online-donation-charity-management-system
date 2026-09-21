namespace DonationAPI.DTOs
{
    public class EmailPreferencesDto
    {
        public bool DonorReceipts { get; set; }
        public bool MonthlyReports { get; set; }
        public bool ProductUpdates { get; set; }
    }
}