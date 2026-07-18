using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Helpers;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class ContactService : IContactService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public ContactService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private static ContactMessageResponseDto ToDto(ContactMessage c) => new()
        {
            ContactMessageId = c.ContactMessageId,
            Name = c.Name,
            Email = c.Email,
            Phone = c.Phone,
            Organization = c.Organization,
            RequestFor = c.RequestFor,
            Message = c.Message,
            CreatedAt = c.CreatedAt
        };

        public async Task<ContactMessageResponseDto> SubmitAsync(ContactMessageCreateDto dto)
        {
            var entry = new ContactMessage
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Organization = dto.Organization,
                RequestFor = dto.RequestFor,
                Message = dto.Message
            };

            _context.ContactMessages.Add(entry);
            await _context.SaveChangesAsync();

            var adminEmails = await _context.Users
                .Where(u => u.Role == UserRole.Admin)
                .Select(u => u.Email)
                .ToListAsync();

            foreach (var adminEmail in adminEmails)
            {
                await _emailService.SendAsync(
                    adminEmail,
                    $"New Contact Message: {entry.RequestFor}",
                    EmailTemplates.AdminNewContactMessage(entry.Name, entry.Email, entry.Phone, entry.Organization, entry.RequestFor, entry.Message)
                );
            }

            return ToDto(entry);
        }

        public async Task<IEnumerable<ContactMessageResponseDto>> GetAllAsync()
        {
            var messages = await _context.ContactMessages
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return messages.Select(ToDto);
        }
    }
}