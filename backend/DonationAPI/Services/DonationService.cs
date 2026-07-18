using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Helpers;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class DonationService : IDonationService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IFraudDetectionService _fraudDetectionService;
        private readonly IEmailService _emailService;

        public DonationService(
            AppDbContext context,
            INotificationService notificationService,
            IFraudDetectionService fraudDetectionService,
            IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _fraudDetectionService = fraudDetectionService;
            _emailService = emailService;
        }

        private static DonationResponseDto ToDto(Donation d) => new()
        {
            DonationId = d.DonationId,
            DonorName = d.IsAnonymous ? "Anonymous" : (d.User?.Name ?? "Unknown"),
            CampaignTitle = d.Campaign?.Title ?? "",
            Amount = d.Amount,
            PaymentMethod = d.Payment?.Method.ToString() ?? "",
            PaymentStatus = d.Payment?.Status.ToString() ?? "",
            TransactionId = d.Payment?.TransactionId,
            ReceiptNumber = d.Receipt?.ReceiptNumber,
            Date = d.Date,
            Status = d.Status.ToString(),
            AdminMessage = d.AdminMessage
        };

        public async Task<DonationResponseDto> CreateDonationAsync(int userId, DonationCreateDto dto)
        {
            var campaign = await _context.Campaigns.FindAsync(dto.CampaignId)
                ?? throw new KeyNotFoundException("Campaign not found.");

            var payment = await _context.Payments
                .Include(p => p.Donation)
                .FirstOrDefaultAsync(p => p.PaymentId == dto.PaymentId)
                ?? throw new KeyNotFoundException("Payment not found.");

            if (payment.Status != PaymentStatus.Success)
                throw new InvalidOperationException("Payment has not been successfully verified.");

            if (payment.Donation != null)
                throw new InvalidOperationException("This payment has already been used for a donation.");

            var fraudCheck = await _fraudDetectionService.EvaluateAsync(userId, dto.CampaignId, payment.Amount);

            var donation = new Donation
            {
                UserId = userId,
                CampaignId = dto.CampaignId,
                Amount = payment.Amount,
                PaymentId = payment.PaymentId,
                IsAnonymous = dto.IsAnonymous,
                Date = DateTime.UtcNow,
                RiskScore = fraudCheck.RiskScore,
                RiskFlags = fraudCheck.Reasons.Count > 0 ? string.Join("; ", fraudCheck.Reasons) : null,
                IsFlaggedForReview = fraudCheck.IsFlagged,
                Status = fraudCheck.IsFlagged ? DonationStatus.Pending : DonationStatus.Approved,
                AdminMessage = fraudCheck.IsFlagged
                    ? $"Thank you! Your donation of Rs.{payment.Amount:N0} to \"{campaign.Title}\" is being reviewed."
                    : $"Amazing! Your donation of Rs.{payment.Amount:N0} to \"{campaign.Title}\" has been confirmed. Thank you for making a real difference today!"
            };

            if (!fraudCheck.IsFlagged)
            {
                campaign.CollectedAmount += payment.Amount;
            }

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            var receipt = new Receipt
            {
                DonationId = donation.DonationId,
                GeneratedDate = DateTime.UtcNow
            };
            _context.Receipts.Add(receipt);
            await _context.SaveChangesAsync();

            await _notificationService.CreateAsync(
                userId,
                fraudCheck.IsFlagged ? "Payment Received" : "Donation Confirmed",
                donation.AdminMessage!
            );

            var full = await _context.Donations
                .Include(d => d.User).Include(d => d.Campaign)
                .Include(d => d.Payment).Include(d => d.Receipt)
                .FirstAsync(d => d.DonationId == donation.DonationId);

            // --- Email notifications (never allowed to break the donation flow) ---
            var donorName = full.User?.Name ?? "Donor";
            var donorEmail = full.User?.Email;

            if (!string.IsNullOrWhiteSpace(donorEmail))
            {
                await _emailService.SendAsync(
                    donorEmail,
                    "Thank You For Your Donation!",
                    EmailTemplates.DonorThankYou(donorName, campaign.Title, payment.Amount)
                );
            }

            var adminEmails = await _context.Users
                .Where(u => u.Role == UserRole.Admin)
                .Select(u => u.Email)
                .ToListAsync();

            foreach (var adminEmail in adminEmails)
            {
                await _emailService.SendAsync(
                    adminEmail,
                    "New Donation Received",
                    EmailTemplates.AdminNewDonation(donorName, donorEmail ?? "N/A", payment.Amount, campaign.Title)
                );
            }

            return ToDto(full);
        }

        public async Task<DonationResponseDto?> UpdateStatusAsync(int id, UpdateDonationStatusDto dto)
        {
            var donation = await _context.Donations
                .Include(d => d.Campaign)
                .FirstOrDefaultAsync(d => d.DonationId == id);

            if (donation == null) return null;

            if (donation.Status != DonationStatus.Approved && dto.Status == DonationStatus.Approved)
            {
                donation.Campaign!.CollectedAmount += donation.Amount;
            }
            else if (donation.Status == DonationStatus.Approved && dto.Status != DonationStatus.Approved)
            {
                donation.Campaign!.CollectedAmount -= donation.Amount;
            }

            donation.Status = dto.Status;
            donation.IsFlaggedForReview = false;

            donation.AdminMessage = dto.Message ?? (dto.Status switch
            {
                DonationStatus.Approved => $"Amazing! Your donation of Rs.{donation.Amount:N0} to \"{donation.Campaign?.Title}\" has been confirmed. Thank you for making a real difference today!",
                DonationStatus.Rejected => $"We're sorry, we couldn't confirm your donation of Rs.{donation.Amount:N0} to \"{donation.Campaign?.Title}\". Please contact support if this seems wrong.",
                _ => donation.AdminMessage
            });

            await _context.SaveChangesAsync();

            await _notificationService.CreateAsync(
                donation.UserId,
                dto.Status == DonationStatus.Approved ? "Donation Approved" : "Donation Update",
                donation.AdminMessage!
            );

            var full = await _context.Donations
                .Include(d => d.User).Include(d => d.Campaign)
                .Include(d => d.Payment).Include(d => d.Receipt)
                .FirstAsync(d => d.DonationId == id);

            return ToDto(full);
        }

        public async Task<IEnumerable<DonationResponseDto>> GetAllAsync()
        {
            var donations = await _context.Donations
                .Include(d => d.User).Include(d => d.Campaign)
                .Include(d => d.Payment).Include(d => d.Receipt)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
            return donations.Select(ToDto);
        }

        public async Task<IEnumerable<DonationResponseDto>> GetByUserAsync(int userId)
        {
            var donations = await _context.Donations
                .Include(d => d.User).Include(d => d.Campaign)
                .Include(d => d.Payment).Include(d => d.Receipt)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
            return donations.Select(ToDto);
        }

        public async Task<DonationResponseDto?> GetByIdAsync(int id)
        {
            var d = await _context.Donations
                .Include(x => x.User).Include(x => x.Campaign)
                .Include(x => x.Payment).Include(x => x.Receipt)
                .FirstOrDefaultAsync(x => x.DonationId == id);
            return d is null ? null : ToDto(d);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Receipt)
                .FirstOrDefaultAsync(d => d.DonationId == id);

            if (donation is null) return false;

            if (donation.Status == DonationStatus.Approved)
            {
                var campaign = await _context.Campaigns.FindAsync(donation.CampaignId);
                if (campaign != null) campaign.CollectedAmount -= donation.Amount;
            }

            if (donation.Receipt != null)
            {
                _context.Receipts.Remove(donation.Receipt);
            }

            _context.Donations.Remove(donation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DonationResponseDto>> GetRecentPublicAsync(int count)
        {
            var donations = await _context.Donations
                .Include(d => d.User).Include(d => d.Campaign)
                .Include(d => d.Payment).Include(d => d.Receipt)
                .Where(d => d.Status == DonationStatus.Approved)
                .OrderByDescending(d => d.Date)
                .Take(count)
                .ToListAsync();

            return donations.Select(ToDto);
        }
        public async Task<int> SendUrgentCampaignEmailAsync(UrgentCampaignEmailDto dto)
        {
            // Distinct donors: one email per unique user who has ever donated
            var donors = await _context.Donations
                .Where(d => d.User != null && !string.IsNullOrWhiteSpace(d.User.Email))
                .Select(d => new { d.User!.Email, d.User.Name })
                .Distinct()
                .ToListAsync();

            if (donors.Count == 0) return 0;

            var donationUrl = string.IsNullOrWhiteSpace(dto.DonationUrl)
                ? "https://yourdomain.com/campaigns"
                : dto.DonationUrl;

            // Limit concurrent sends so the server/SMTP provider doesn't get hammered
            var semaphore = new SemaphoreSlim(10);
            var sentCount = 0;

            var sendTasks = donors.Select(async donor =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var html = EmailTemplates.UrgentCampaignAlert(donor.Name, dto.Message, donationUrl);
                    await _emailService.SendAsync(donor.Email, dto.Subject, html);
                    Interlocked.Increment(ref sentCount);
                }
                catch
                {
                    // Swallow per-recipient failures — one bad email shouldn't stop the batch.
                    // (Wire this into your logger if you have one, e.g. ILogger<DonationService>)
                }
                finally
                {
                    semaphore.Release();
                }
            });

            await Task.WhenAll(sendTasks);
            return sentCount;
        }
    }
}