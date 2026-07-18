using System.ComponentModel.DataAnnotations;
using DonationAPI.Models;

namespace DonationAPI.DTOs
{
    public class AidDeliveryResponseDto
    {
        public int AidDeliveryId { get; set; }
        public int ApplicationId { get; set; }
        public string ApplicantName { get; set; } = string.Empty;
        public int VolunteerId { get; set; }
        public string VolunteerName { get; set; } = string.Empty;
        public decimal AmountDelivered { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime ScheduledAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }

    public class CreateAidDeliveryDto
    {
        [Required] public int ApplicationId { get; set; }
        [Required] public int VolunteerId { get; set; }
        [Range(1, double.MaxValue)] public decimal AmountDelivered { get; set; }
        [Required] public DeliveryMethod Method { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateAidDeliveryStatusDto
    {
        [Required] public DeliveryStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}