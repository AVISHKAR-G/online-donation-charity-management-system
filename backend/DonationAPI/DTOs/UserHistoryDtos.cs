namespace DonationAPI.DTOs
{
    public class DonationHistoryItemDto
    {
        public int DonationId { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? AdminMessage { get; set; }
    }

    public class ApplicationHistoryItemDto
    {
        public int ApplicationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal AmountRequired { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? DocumentPath { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AidDeliveryHistoryItemDto
    {
        public int AidDeliveryId { get; set; }
        public int ApplicationId { get; set; }
        public decimal AmountDelivered { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }

    public class UserHistoryDto
    {
        public List<DonationHistoryItemDto> Donations { get; set; } = new();
        public List<ApplicationHistoryItemDto> Applications { get; set; } = new();
        public List<AidDeliveryHistoryItemDto> AidReceived { get; set; } = new();
    }
}