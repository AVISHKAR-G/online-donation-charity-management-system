using System;
using System.Collections.Generic;

namespace DonationAPI.DTOs
{
    public class DashboardSummaryDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalDonors { get; set; }
        public int TotalCampaigns { get; set; }
        public int ActiveCampaigns { get; set; }
        public int PendingApprovalCampaigns { get; set; }
        public int TotalBeneficiaries { get; set; }
        public List<MonthlyDonationDto> MonthlyDonations { get; set; } = new();
        public List<CategoryDonationDto> DonationsByCategory { get; set; } = new();

        // --- Added for the redesigned dashboard ---
        public double TotalDonationsChange { get; set; }
        public double TotalDonorsChange { get; set; }
        public double TotalCampaignsChange { get; set; }
        public double TotalBeneficiariesChange { get; set; }
        public double ActiveCampaignsChange { get; set; }

        public int UnreadNotifications { get; set; }
        public string? AdminAvatarUrl { get; set; }

        public List<MonthlyDonationDto> DonationsOverTime { get; set; } = new();
        public List<RegionBreakdownDto> BeneficiariesByRegion { get; set; } = new();
        public List<DashboardRecentDonationDto> RecentDonations { get; set; } = new();
        public List<DashboardTopCampaignDto> TopCampaigns { get; set; } = new();

        public decimal FundsRaisedThisMonth { get; set; }
        public double FundsRaisedChange { get; set; }
        public int SuccessfulCampaigns { get; set; }
        public double SuccessfulCampaignsChange { get; set; }
        public int VolunteerHours { get; set; }
        public double VolunteerHoursChange { get; set; }
    }

    public class MonthlyDonationDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }

    public class CategoryDonationDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public double Percentage { get; set; }
    }

    public class RegionBreakdownDto
    {
        public string Region { get; set; } = string.Empty;
        public double Percent { get; set; }
    }

    public class DashboardRecentDonationDto
    {
        public int Id { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public decimal Amount { get; set; }
        public string TimeAgo { get; set; } = string.Empty;
    }

    public class DashboardTopCampaignDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public decimal Raised { get; set; }
        public decimal Goal { get; set; }
        public int Percent { get; set; }
    }
    public class CampaignPerformanceDto
    {
        public int CampaignId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal CollectedAmount { get; set; }
        public double PercentageCompleted { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}