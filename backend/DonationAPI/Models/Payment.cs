using System.ComponentModel.DataAnnotations;
namespace DonationAPI.Models
{
    public enum PaymentMethod
    {
        UPI = 0,
        Card = 1,
        NetBanking = 2,
        PayPal = 3,
        Wallet = 4
    }
    public enum PaymentStatus
    {
        Pending = 0,
        Success = 1,
        Failed = 2,
        Refunded = 3
    }
    public class Payment
    {
        public int PaymentId { get; set; }
        [Required]
        public string TransactionId { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper();
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public Donation? Donation { get; set; }

        // --- Razorpay fields ---
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
    }
}