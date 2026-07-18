using DonationAPI.Models;

namespace DonationAPI.DTOs
{
    public class CreateOrderRequestDto
    {
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
    }

    public class CreateOrderResponseDto
    {
        public int PaymentId { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string KeyId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
    }

    public class VerifyPaymentDto
    {
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
    }

    public class VerifyPaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int PaymentId { get; set; }
    }

    public class PaymentResponseDto
    {
        public int PaymentId { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Donor { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
    }
}