using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;

namespace DonationAPI.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var now = DateTime.UtcNow;
            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            var successfulDonations = _context.Donations
                .Include(d => d.Payment)
                .Include(d => d.Campaign)
                .Include(d => d.User)
                .Where(d => d.Payment != null && d.Payment.Status == PaymentStatus.Success);

            // ---------- Totals ----------
            var totalDonations = await successfulDonations.SumAsync(d => (decimal?)d.Amount) ?? 0;
            var thisMonthDonationTotal = await successfulDonations
                .Where(d => d.Date >= startOfThisMonth)
                .SumAsync(d => (decimal?)d.Amount) ?? 0;
            var lastMonthDonationTotal = await successfulDonations
                .Where(d => d.Date >= startOfLastMonth && d.Date < startOfThisMonth)
                .SumAsync(d => (decimal?)d.Amount) ?? 0;

            var totalDonors = await successfulDonations.Select(d => d.UserId).Distinct().CountAsync();
            var thisMonthDonors = await successfulDonations
                .Where(d => d.Date >= startOfThisMonth)
                .Select(d => d.UserId).Distinct().CountAsync();
            var lastMonthDonors = await successfulDonations
                .Where(d => d.Date >= startOfLastMonth && d.Date < startOfThisMonth)
                .Select(d => d.UserId).Distinct().CountAsync();

            var totalCampaigns = await _context.Campaigns.CountAsync();
            var thisMonthCampaigns = await _context.Campaigns.CountAsync(c => c.CreatedAt >= startOfThisMonth);
            var lastMonthCampaigns = await _context.Campaigns
                .CountAsync(c => c.CreatedAt >= startOfLastMonth && c.CreatedAt < startOfThisMonth);

            var totalBeneficiaries = await _context.Beneficiaries.CountAsync();
            var thisMonthBeneficiaries = await _context.Beneficiaries.CountAsync(b => b.CreatedAt >= startOfThisMonth);
            var lastMonthBeneficiaries = await _context.Beneficiaries
                .CountAsync(b => b.CreatedAt >= startOfLastMonth && b.CreatedAt < startOfThisMonth);

            var activeCampaigns = await _context.Campaigns.CountAsync(c => c.Status == CampaignStatus.Active);
            var thisMonthActive = await _context.Campaigns
                .CountAsync(c => c.Status == CampaignStatus.Active && c.CreatedAt >= startOfThisMonth);
            var lastMonthActive = await _context.Campaigns
                .CountAsync(c => c.Status == CampaignStatus.Active && c.CreatedAt >= startOfLastMonth && c.CreatedAt < startOfThisMonth);

            var pendingApprovalCampaigns = await _context.Campaigns.CountAsync(c => c.Status == CampaignStatus.PendingApproval);
            var successfulCampaigns = await _context.Campaigns.CountAsync(c => c.Status == CampaignStatus.Completed);

            // ---------- Monthly series (last 6 months) ----------
            var sixMonthsAgo = startOfThisMonth.AddMonths(-5);
            var recentDonationRows = await successfulDonations
                .Where(d => d.Date >= sixMonthsAgo)
                .Select(d => new { d.Date, d.Amount })
                .ToListAsync();

            var monthlySeries = new List<MonthlyDonationDto>();
            for (int i = 5; i >= 0; i--)
            {
                var monthStart = startOfThisMonth.AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1);
                var monthTotal = recentDonationRows
                    .Where(d => d.Date >= monthStart && d.Date < monthEnd)
                    .Sum(d => d.Amount);
                monthlySeries.Add(new MonthlyDonationDto { Month = monthStart.ToString("MMM"), Total = monthTotal });
            }

            // ---------- Donations by category ----------
            var categoryRows = await successfulDonations
                .Select(d => new { Category = d.Campaign!.Category ?? "Uncategorized", d.Amount })
                .ToListAsync();

            var groupedCategories = categoryRows
                .GroupBy(x => x.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) })
                .OrderByDescending(g => g.Total)
                .ToList();

            var categoryGrandTotal = groupedCategories.Sum(g => g.Total);
            var donationsByCategory = groupedCategories.Select(g => new CategoryDonationDto
            {
                Category = g.Category,
                Total = g.Total,
                Percentage = categoryGrandTotal == 0 ? 0 : Math.Round((double)(g.Total / categoryGrandTotal) * 100, 1)
            }).ToList();

            // ---------- Recent donations ----------
            var recentDonationEntities = await successfulDonations
                .OrderByDescending(d => d.Date)
                .Take(5)
                .ToListAsync();

            var recentDonations = recentDonationEntities.Select(d => new DashboardRecentDonationDto
            {
                Id = d.DonationId,
                DonorName = d.IsAnonymous ? "Anonymous" : (d.User?.Name ?? "Unknown"),
                AvatarUrl = null,
                Amount = d.Amount,
                TimeAgo = TimeAgo(d.Date)
            }).ToList();

            // ---------- Top campaigns ----------
            var topCampaignEntities = await _context.Campaigns
                .Where(c => c.Status == CampaignStatus.Active || c.Status == CampaignStatus.Completed)
                .OrderByDescending(c => c.CollectedAmount)
                .Take(4)
                .ToListAsync();

            var topCampaigns = topCampaignEntities.Select(c => new DashboardTopCampaignDto
            {
                Id = c.CampaignId,
                Title = c.Title,
                ThumbnailUrl = c.ImageUrl,
                Raised = c.CollectedAmount,
                Goal = c.TargetAmount,
                Percent = (int)Math.Round(c.PercentageCompleted)
            }).ToList();

            // ---------- Beneficiaries by region ----------
            var regionRows = await _context.Beneficiaries
                .GroupBy(b => b.Region)
                .Select(g => new { Region = g.Key, Count = g.Count() })
                .ToListAsync();

            var regionGrandTotal = regionRows.Sum(r => r.Count);
            var beneficiariesByRegion = regionRows.Select(r => new RegionBreakdownDto
            {
                Region = r.Region.ToString(),
                Percent = regionGrandTotal == 0 ? 0 : Math.Round((double)r.Count / regionGrandTotal * 100, 1)
            })
            .OrderByDescending(r => r.Percent)
            .ToList();

            return new DashboardSummaryDto
            {
                TotalDonations = totalDonations,
                TotalDonationsChange = PercentChange(thisMonthDonationTotal, lastMonthDonationTotal),

                TotalDonors = totalDonors,
                TotalDonorsChange = PercentChange(thisMonthDonors, lastMonthDonors),

                TotalCampaigns = totalCampaigns,
                TotalCampaignsChange = PercentChange(thisMonthCampaigns, lastMonthCampaigns),

                ActiveCampaigns = activeCampaigns,
                ActiveCampaignsChange = PercentChange(thisMonthActive, lastMonthActive),

                PendingApprovalCampaigns = pendingApprovalCampaigns,

                TotalBeneficiaries = totalBeneficiaries,
                TotalBeneficiariesChange = PercentChange(thisMonthBeneficiaries, lastMonthBeneficiaries),

                MonthlyDonations = monthlySeries,
                DonationsByCategory = donationsByCategory,
                DonationsOverTime = monthlySeries,

                UnreadNotifications = 0,
                AdminAvatarUrl = null,

                BeneficiariesByRegion = beneficiariesByRegion,

                RecentDonations = recentDonations,
                TopCampaigns = topCampaigns,

                FundsRaisedThisMonth = thisMonthDonationTotal,
                FundsRaisedChange = PercentChange(thisMonthDonationTotal, lastMonthDonationTotal),

                SuccessfulCampaigns = successfulCampaigns,
                SuccessfulCampaignsChange = 0,

                VolunteerHours = 0,
                VolunteerHoursChange = 0
            };
        }

        public async Task<IEnumerable<CampaignPerformanceDto>> GetCampaignPerformanceAsync()
        {
            var campaigns = await _context.Campaigns
                .OrderByDescending(c => c.CollectedAmount)
                .ToListAsync();

            return campaigns.Select(c => new CampaignPerformanceDto
            {
                CampaignId = c.CampaignId,
                Title = c.Title,
                TargetAmount = c.TargetAmount,
                CollectedAmount = c.CollectedAmount,
                PercentageCompleted = c.TargetAmount == 0 ? 0 :
                    Math.Round((double)(c.CollectedAmount / c.TargetAmount) * 100, 1),
                Status = c.Status.ToString()
            }).ToList();
        }

        private static double PercentChange(decimal current, decimal previous)
        {
            if (previous == 0) return current == 0 ? 0 : 100;
            return Math.Round((double)((current - previous) / previous) * 100, 1);
        }

        private static double PercentChange(int current, int previous)
        {
            if (previous == 0) return current == 0 ? 0 : 100;
            return Math.Round(((double)(current - previous) / previous) * 100, 1);
        }

        private static string TimeAgo(DateTime date)
        {
            var span = DateTime.UtcNow - date;
            if (span.TotalMinutes < 60) return $"{Math.Max(1, (int)span.TotalMinutes)} min ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours} hour{((int)span.TotalHours == 1 ? "" : "s")} ago";
            if (span.TotalDays < 30) return $"{(int)span.TotalDays} day{((int)span.TotalDays == 1 ? "" : "s")} ago";
            return date.ToString("MMM dd, yyyy");
        }
    }
}