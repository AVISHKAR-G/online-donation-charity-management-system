namespace DonationAPI.Models
{
    public class Receipt
    {
        public int ReceiptId { get; set; }

        public int DonationId { get; set; }
        public Donation? Donation { get; set; }

        public string ReceiptNumber { get; set; } = $"RCPT-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()}";

        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
    }
}
