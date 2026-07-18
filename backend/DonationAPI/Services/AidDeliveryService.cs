using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class AidDeliveryService : IAidDeliveryService
    {
        private readonly AppDbContext _context;

        public AidDeliveryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AidDeliveryResponseDto>> GetAllAsync()
        {
            return await _context.AidDeliveries
                .Include(d => d.Application)
                .Include(d => d.Volunteer)
                .Select(d => new AidDeliveryResponseDto
                {
                    AidDeliveryId = d.AidDeliveryId,
                    ApplicationId = d.ApplicationId,
                    ApplicantName = d.Application != null ? d.Application.FullName : string.Empty,
                    VolunteerId = d.VolunteerId,
                    VolunteerName = d.Volunteer != null ? d.Volunteer.Name : string.Empty,
                    AmountDelivered = d.AmountDelivered,
                    Method = d.Method.ToString(),
                    Status = d.Status.ToString(),
                    Notes = d.Notes,
                    ScheduledAt = d.ScheduledAt,
                    DeliveredAt = d.DeliveredAt
                })
                .ToListAsync();
        }

        public async Task<AidDeliveryResponseDto?> GetByIdAsync(int id)
        {
            var d = await _context.AidDeliveries
                .Include(x => x.Application)
                .Include(x => x.Volunteer)
                .FirstOrDefaultAsync(x => x.AidDeliveryId == id);

            if (d == null) return null;

            return new AidDeliveryResponseDto
            {
                AidDeliveryId = d.AidDeliveryId,
                ApplicationId = d.ApplicationId,
                ApplicantName = d.Application?.FullName ?? string.Empty,
                VolunteerId = d.VolunteerId,
                VolunteerName = d.Volunteer?.Name ?? string.Empty,
                AmountDelivered = d.AmountDelivered,
                Method = d.Method.ToString(),
                Status = d.Status.ToString(),
                Notes = d.Notes,
                ScheduledAt = d.ScheduledAt,
                DeliveredAt = d.DeliveredAt
            };
        }

        public async Task<AidDeliveryResponseDto> CreateAsync(CreateAidDeliveryDto dto)
        {
            var delivery = new AidDelivery
            {
                ApplicationId = dto.ApplicationId,
                VolunteerId = dto.VolunteerId,
                AmountDelivered = dto.AmountDelivered,
                Method = dto.Method,
                Notes = dto.Notes,
                Status = DeliveryStatus.Scheduled,
                ScheduledAt = DateTime.UtcNow
            };

            _context.AidDeliveries.Add(delivery);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(delivery.AidDeliveryId))!;
        }

        public async Task<AidDeliveryResponseDto?> UpdateStatusAsync(int id, UpdateAidDeliveryStatusDto dto)
        {
            var delivery = await _context.AidDeliveries.FindAsync(id);
            if (delivery == null) return null;

            delivery.Status = dto.Status;
            if (dto.Notes != null) delivery.Notes = dto.Notes;
            if (dto.Status == DeliveryStatus.Delivered) delivery.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }
    }
}