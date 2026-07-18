using DonationAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class DonationCreateDto
    {
        [Required] public int PaymentId { get; set; }
        [Required] public int CampaignId { get; set; }
        public bool IsAnonymous { get; set; } = false;
    }

    public class DonationResponseDto
    {
        public int DonationId { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string CampaignTitle { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? ReceiptNumber { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? AdminMessage { get; set; }
    }

    public class UpdateDonationStatusDto
    {
        [Required]
        public DonationStatus Status { get; set; }
        public string? Message { get; set; }
    }

    public class RecentDonationDto
    {
        public string DonorName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
    }
}