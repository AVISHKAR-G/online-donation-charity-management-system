using DonationAPI.Models;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DonationAPI.DTOs
{
    public class AssistanceApplicationCreateDto
    {
        [Required] public string FullName { get; set; } = string.Empty;
        [Required] public string Email { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        [Required] public string Address { get; set; } = string.Empty;
        [Required] public int Type { get; set; } // AssistanceType as int from form
        [Range(1, double.MaxValue)] public decimal AmountRequired { get; set; }
        [Required] public string Reason { get; set; } = string.Empty;
        public IFormFile? Document { get; set; }
    }

    public class AssistanceApplicationResponseDto
    {
        public int ApplicationId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal AmountRequired { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? DocumentPath { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Region Region { get; set; } = Region.North;

        public class UpdateApplicationStatusDto
        {
            public int Status { get; set; } // 0=Pending,1=UnderVerification,2=Approved,3=Rejected,4=FundAllocated
            public string? AdminReason { get; set; } // optional note, shown in the notification
        }

        public class AllocateFundsDto
        {
            public int CampaignId { get; set; }
            public decimal AllocatedAmount { get; set; }
            public Region Region { get; set; } = Region.North;
        }
    }

}