namespace DonationAPI.DTOs
{
    public class SecuritySettingsDto
    {
        public bool TwoFactorEnabled { get; set; }
        public bool LoginAlertsEnabled { get; set; }
    }
}