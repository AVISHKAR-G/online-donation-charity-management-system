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
    [Route("api/[controller]")]
    [Authorize]
    public class DonorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonorController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/donor?search=&role filter handled client-side; admin only
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(u => u.Name.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
            }

            var donors = await query
                .Select(u => new DonorListDto
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    TotalDonated = _context.Donations
                        .Where(d => d.UserId == u.UserId && d.Payment != null && d.Payment.Status == PaymentStatus.Success)
                        .Sum(d => (decimal?)d.Amount) ?? 0,
                    TotalTransactions = _context.Donations
                        .Count(d => d.UserId == u.UserId)
                })
                .OrderByDescending(d => d.TotalDonated)
                .ToListAsync();

            return Ok(donors);
        }

        // PUT /api/donor/{id}/deactivate
        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();

            user.IsActive = !user.IsActive; // toggles active/inactive
            await _context.SaveChangesAsync();
            return Ok(new { user.UserId, user.IsActive });
        }

        // GET /api/donor/me — logged-in donor's own profile
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            var profile = new DonorProfileDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                TotalDonated = await _context.Donations
                    .Where(d => d.UserId == userId && d.Payment != null && d.Payment.Status == PaymentStatus.Success)
                    .SumAsync(d => (decimal?)d.Amount) ?? 0,
                TotalTransactions = await _context.Donations.CountAsync(d => d.UserId == userId)
            };

            return Ok(profile);
        }

        // PUT /api/donor/me — update own profile
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile(DonorUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            user.Name = dto.Name;
            user.Email = dto.Email;
            await _context.SaveChangesAsync();
            return Ok(user);
        }
    }
}