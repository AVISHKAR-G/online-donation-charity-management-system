using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/settings/email-preferences")]
    [Authorize]
    public class EmailPreferencesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmailPreferencesController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;
            return int.Parse(idClaim!);
        }

        [HttpGet]
        public async Task<ActionResult<EmailPreferencesDto>> Get()
        {
            var userId = GetUserId();
            var prefs = await _context.EmailPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                return Ok(new EmailPreferencesDto
                {
                    DonorReceipts = true,
                    MonthlyReports = true,
                    ProductUpdates = false
                });
            }

            return Ok(new EmailPreferencesDto
            {
                DonorReceipts = prefs.DonorReceipts,
                MonthlyReports = prefs.MonthlyReports,
                ProductUpdates = prefs.ProductUpdates
            });
        }

        [HttpPut]
        public async Task<ActionResult<EmailPreferencesDto>> Update([FromBody] EmailPreferencesDto dto)
        {
            var userId = GetUserId();
            var prefs = await _context.EmailPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                prefs = new EmailPreferences { UserId = userId };
                _context.EmailPreferences.Add(prefs);
            }

            prefs.DonorReceipts = dto.DonorReceipts;
            prefs.MonthlyReports = dto.MonthlyReports;
            prefs.ProductUpdates = dto.ProductUpdates;

            await _context.SaveChangesAsync();

            return Ok(dto);
        }
    }
}