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
    [Route("api/settings/security")]
    [Authorize]
    public class SecuritySettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SecuritySettingsController(AppDbContext context)
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
        public async Task<ActionResult<SecuritySettingsDto>> Get()
        {
            var userId = GetUserId();
            var settings = await _context.SecuritySettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                return Ok(new SecuritySettingsDto
                {
                    TwoFactorEnabled = false,
                    LoginAlertsEnabled = true
                });
            }

            return Ok(new SecuritySettingsDto
            {
                TwoFactorEnabled = settings.TwoFactorEnabled,
                LoginAlertsEnabled = settings.LoginAlertsEnabled
            });
        }

        [HttpPut]
        public async Task<ActionResult<SecuritySettingsDto>> Update([FromBody] SecuritySettingsDto dto)
        {
            var userId = GetUserId();
            var settings = await _context.SecuritySettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                settings = new SecuritySettings { UserId = userId };
                _context.SecuritySettings.Add(settings);
            }

            settings.TwoFactorEnabled = dto.TwoFactorEnabled;
            settings.LoginAlertsEnabled = dto.LoginAlertsEnabled;

            await _context.SaveChangesAsync();

            return Ok(dto);
        }
    }
}