namespace DonationAPI.DTOs
{
    public class SearchResultDto
    {
        public string Type { get; set; } = string.Empty; // "Donor" | "Campaign" | "Beneficiary"
        public int Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
    }
}