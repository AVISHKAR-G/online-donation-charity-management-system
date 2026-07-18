using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly AppDbContext _context;

        public CampaignService(AppDbContext context)
        {
            _context = context;
        }

        private static CampaignResponseDto ToDto(Campaign c) => new()
        {
            CampaignId = c.CampaignId,
            Title = c.Title,
            Description = c.Description,
            Category = c.Category,
            ImageUrl = c.ImageUrl,
            TargetAmount = c.TargetAmount,
            CollectedAmount = c.CollectedAmount,
            PercentageCompleted = c.PercentageCompleted,
            Status = c.Status.ToString(),
            CreatedAt = c.CreatedAt,
            EndDate = c.EndDate
        };

        public async Task<IEnumerable<CampaignResponseDto>> GetAllAsync(string? status = null, string? category = null, string? search = null)
        {
            var query = _context.Campaigns.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<CampaignStatus>(status, true, out var s))
                query = query.Where(c => c.Status == s);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(c => c.Category == category);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));

            var campaigns = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            return campaigns.Select(ToDto);
        }

        public async Task<CampaignResponseDto?> GetByIdAsync(int id)
        {
            var c = await _context.Campaigns.FindAsync(id);
            return c is null ? null : ToDto(c);
        }

        public async Task<CampaignResponseDto> CreateAsync(CampaignCreateDto dto)
        {
            var campaign = new Campaign
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                TargetAmount = dto.TargetAmount,
                EndDate = dto.EndDate,
                Status = CampaignStatus.PendingApproval
            };

            _context.Campaigns.Add(campaign);
            await _context.SaveChangesAsync();
            return ToDto(campaign);
        }

        public async Task<CampaignResponseDto> UpdateAsync(int id, CampaignUpdateDto dto)
        {
            var campaign = await _context.Campaigns.FindAsync(id)
                ?? throw new KeyNotFoundException("Campaign not found.");

            campaign.Title = dto.Title;
            campaign.Description = dto.Description;
            campaign.Category = dto.Category;
            campaign.ImageUrl = dto.ImageUrl;
            campaign.TargetAmount = dto.TargetAmount;
            campaign.EndDate = dto.EndDate;
            campaign.Status = (CampaignStatus)dto.Status;

            await _context.SaveChangesAsync();
            return ToDto(campaign);
        }

        public async Task DeleteAsync(int id)
        {
            var campaign = await _context.Campaigns.FindAsync(id)
                ?? throw new KeyNotFoundException("Campaign not found.");

            _context.Campaigns.Remove(campaign);
            await _context.SaveChangesAsync();
        }
        public async Task<CampaignTransparencyDto> GetTransparencyAsync(int campaignId)
        {
            var campaign = await _context.Campaigns.FindAsync(campaignId)
                ?? throw new KeyNotFoundException("Campaign not found.");

            var beneficiaries = await _context.Beneficiaries
                .Where(b => b.CampaignId == campaignId)
                .ToListAsync();

            var amountUsed = beneficiaries
                .Where(b => b.Status == BeneficiaryStatus.FundsDisbursed)
                .Sum(b => b.AllocatedAmount);

            var helpedCount = beneficiaries
                .Count(b => b.Status == BeneficiaryStatus.FundsDisbursed);

            return new CampaignTransparencyDto
            {
                CampaignId = campaign.CampaignId,
                Title = campaign.Title,
                TotalCollected = campaign.CollectedAmount,
                AmountUsed = amountUsed,
                RemainingBalance = campaign.CollectedAmount - amountUsed,
                BeneficiariesHelped = helpedCount,
                ProgressPercent = campaign.TargetAmount == 0 ? 0 :
                    Math.Round((double)(campaign.CollectedAmount / campaign.TargetAmount) * 100, 1)
            };
        }
    }
}
