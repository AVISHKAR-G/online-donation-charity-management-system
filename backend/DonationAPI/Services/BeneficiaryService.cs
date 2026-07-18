using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class BeneficiaryService : IBeneficiaryService
    {
        private readonly AppDbContext _context;

        public BeneficiaryService(AppDbContext context)
        {
            _context = context;
        }

        private static BeneficiaryResponseDto ToDto(Beneficiary b) => new()
        {
            BeneficiaryId = b.BeneficiaryId,
            Name = b.Name,
            Purpose = b.Purpose,
            CampaignId = b.CampaignId,
            CampaignTitle = b.Campaign?.Title ?? "",
            AllocatedAmount = b.AllocatedAmount,
            Status = b.Status.ToString(),
            CreatedAt = b.CreatedAt
        };

        public async Task<IEnumerable<BeneficiaryResponseDto>> GetAllAsync()
        {
            var list = await _context.Beneficiaries
                .Include(b => b.Campaign)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
            return list.Select(ToDto);
        }

        public async Task<BeneficiaryResponseDto> CreateAsync(CreateBeneficiaryDto dto)
        {
            var campaign = await _context.Campaigns.FindAsync(dto.CampaignId)
                ?? throw new KeyNotFoundException("Campaign not found.");

            var beneficiary = new Beneficiary
            {
                Name = dto.Name,
                Purpose = dto.Purpose,
                CampaignId = dto.CampaignId,
                AllocatedAmount = dto.AllocatedAmount,
                Status = BeneficiaryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Beneficiaries.Add(beneficiary);
            await _context.SaveChangesAsync();

            var full = await _context.Beneficiaries
                .Include(b => b.Campaign)
                .FirstAsync(b => b.BeneficiaryId == beneficiary.BeneficiaryId);

            return ToDto(full);
        }

        public async Task<BeneficiaryResponseDto?> UpdateStatusAsync(int id, UpdateBeneficiaryStatusDto dto, int adminUserId)
        {
            var beneficiary = await _context.Beneficiaries
                .Include(b => b.Campaign)
                .FirstOrDefaultAsync(b => b.BeneficiaryId == id);

            if (beneficiary == null) return null;

            var wasAlreadyDisbursed = beneficiary.Status == BeneficiaryStatus.FundsDisbursed;
            beneficiary.Status = dto.Status;
            await _context.SaveChangesAsync();

            // Auto-create the Aid Delivery record so it shows up under "Aid Received"
            if (dto.Status == BeneficiaryStatus.FundsDisbursed
                && !wasAlreadyDisbursed
                && beneficiary.ApplicationId.HasValue)
            {
                var alreadyExists = await _context.AidDeliveries
                    .AnyAsync(d => d.ApplicationId == beneficiary.ApplicationId.Value);

                if (!alreadyExists)
                {
                    var delivery = new AidDelivery
                    {
                        ApplicationId = beneficiary.ApplicationId.Value,
                        VolunteerId = adminUserId,
                        AmountDelivered = beneficiary.AllocatedAmount,
                        Method = DeliveryMethod.BankTransfer,
                        Status = DeliveryStatus.Delivered,
                        Notes = "Auto-generated on fund disbursement",
                        ScheduledAt = DateTime.UtcNow,
                        DeliveredAt = DateTime.UtcNow
                    };
                    _context.AidDeliveries.Add(delivery);
                    await _context.SaveChangesAsync();
                }
            }

            return ToDto(beneficiary);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var beneficiary = await _context.Beneficiaries.FindAsync(id);
            if (beneficiary is null) return false;

            _context.Beneficiaries.Remove(beneficiary);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}