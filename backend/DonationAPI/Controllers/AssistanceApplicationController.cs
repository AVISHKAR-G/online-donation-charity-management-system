using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Helpers;
using DonationAPI.Models;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static DonationAPI.DTOs.AssistanceApplicationResponseDto;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssistanceApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public AssistanceApplicationController(
            AppDbContext context,
            IWebHostEnvironment env,
            INotificationService notificationService,
            IEmailService emailService)
        {
            _context = context;
            _env = env;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        private static AssistanceApplicationResponseDto ToDto(AssistanceApplication a) => new()
        {
            ApplicationId = a.ApplicationId,
            FullName = a.FullName,
            Email = a.Email,
            Phone = a.Phone,
            Address = a.Address,
            Type = a.Type.ToString(),
            AmountRequired = a.AmountRequired,
            Reason = a.Reason,
            DocumentPath = a.DocumentPath,
            Status = a.Status.ToString(),
            CreatedAt = a.CreatedAt
        };

        // POST /api/assistanceapplication
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Submit([FromForm] AssistanceApplicationCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            string? documentPath = null;
            if (dto.Document is not null && dto.Document.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "documents");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.Document.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Document.CopyToAsync(stream);
                }

                documentPath = $"/uploads/documents/{fileName}";
            }

            var application = new AssistanceApplication
            {
                UserId = userId,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                Type = (AssistanceType)dto.Type,
                AmountRequired = dto.AmountRequired,
                Reason = dto.Reason,
                DocumentPath = documentPath,
                Status = ApplicationStatus.Pending
            };

            _context.AssistanceApplications.Add(application);
            await _context.SaveChangesAsync();

            // Notify all admins by email of the new assistance request
            var adminEmails = await _context.Users
                .Where(u => u.Role == UserRole.Admin)
                .Select(u => u.Email)
                .ToListAsync();

            foreach (var adminEmail in adminEmails)
            {
                await _emailService.SendAsync(
                    adminEmail,
                    "New Donation Request Received",
                    EmailTemplates.AdminNewAssistanceRequest(application.FullName, application.Reason, application.AmountRequired)
                );
            }

            return Ok(ToDto(application));
        }

        // GET /api/assistanceapplication/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyApplications()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var applications = await _context.AssistanceApplications
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(applications.Select(ToDto));
        }

        // GET /api/assistanceapplication  — admin: view all applications
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var applications = await _context.AssistanceApplications
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(applications.Select(ToDto));
        }

        // PATCH /api/assistanceapplication/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateApplicationStatusDto dto)
        {
            var application = await _context.AssistanceApplications.FindAsync(id);
            if (application is null) return NotFound();

            application.Status = (ApplicationStatus)dto.Status;
            await _context.SaveChangesAsync();

            // Notify the applicant when their application is rejected
            if (application.Status == ApplicationStatus.Rejected)
            {
                var message = string.IsNullOrWhiteSpace(dto.AdminReason)
                    ? $"Your {application.Type} assistance application was not approved."
                    : $"Your {application.Type} assistance application was not approved. Reason: {dto.AdminReason}";

                await _notificationService.CreateAsync(
                    application.UserId,
                    "Application Rejected",
                    message
                );
            }
            else if (application.Status == ApplicationStatus.Approved)
            {
                await _notificationService.CreateAsync(
                    application.UserId,
                    "Application Approved",
                    $"Your {application.Type} assistance application has been approved."
                );

                await _emailService.SendAsync(
                    application.Email,
                    "Your Request Has Been Approved!",
                    EmailTemplates.ApplicantApproved(application.FullName, application.AmountRequired)
                );
            }

            return Ok(ToDto(application));
        }

        // PATCH /api/assistanceapplication/{id}/allocate-funds
        [HttpPatch("{id}/allocate-funds")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AllocateFunds(int id, AllocateFundsDto dto)
        {
            var application = await _context.AssistanceApplications.FindAsync(id);
            if (application is null) return NotFound();

            var campaign = await _context.Campaigns.FindAsync(dto.CampaignId);
            if (campaign is null) return BadRequest(new { message = "Campaign not found." });

            var beneficiary = new Beneficiary
            {
                Name = application.FullName,
                Purpose = application.Reason,
                CampaignId = dto.CampaignId,
                AllocatedAmount = dto.AllocatedAmount,
                Status = 0,
                ApplicationId = application.ApplicationId
            };

            _context.Beneficiaries.Add(beneficiary);
            application.Status = ApplicationStatus.FundAllocated;

            await _context.SaveChangesAsync();

            return Ok(ToDto(application));
        }
    }
}