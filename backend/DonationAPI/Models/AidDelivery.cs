using System.ComponentModel.DataAnnotations;

namespace DonationAPI.Models
{
    public enum DeliveryMethod
    {
        BankTransfer = 0,
        Cash = 1,
        InKind = 2
    }

    public enum DeliveryStatus
    {
        Scheduled = 0,
        InProgress = 1,
        Delivered = 2,
        Failed = 3
    }

    public class AidDelivery
    {
        public int AidDeliveryId { get; set; }

        public int ApplicationId { get; set; }
        public AssistanceApplication? Application { get; set; }

        public int VolunteerId { get; set; }
        public User? Volunteer { get; set; }

        [Range(1, double.MaxValue)]
        public decimal AmountDelivered { get; set; }

        public DeliveryMethod Method { get; set; } = DeliveryMethod.BankTransfer;

        public DeliveryStatus Status { get; set; } = DeliveryStatus.Scheduled;

        public string? Notes { get; set; }

        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow;

        public DateTime? DeliveredAt { get; set; }
    }
}