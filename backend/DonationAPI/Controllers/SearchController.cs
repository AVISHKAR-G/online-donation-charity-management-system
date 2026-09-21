using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            {
                return Ok(new List<SearchResultDto>());
            }

            var term = q.Trim();
            const int perTypeLimit = 5;

            var donors = await _context.Users
                .Where(u => u.Role == UserRole.Donor &&
                            (EF.Functions.Like(u.Name, $"%{term}%") || EF.Functions.Like(u.Email, $"%{term}%")))
                .OrderBy(u => u.Name)
                .Take(perTypeLimit)
                .Select(u => new SearchResultDto
                {
                    Type = "Donor",
                    Id = u.UserId,
                    Label = u.Name,
                    Subtitle = u.Email
                })
                .ToListAsync();

            var campaigns = await _context.Campaigns
                .Where(c => EF.Functions.Like(c.Title, $"%{term}%"))
                .OrderBy(c => c.Title)
                .Take(perTypeLimit)
                .Select(c => new SearchResultDto
                {
                    Type = "Campaign",
                    Id = c.CampaignId,
                    Label = c.Title,
                    Subtitle = c.Status.ToString()
                })
                .ToListAsync();

            var beneficiaries = await _context.Beneficiaries
                .Where(b => EF.Functions.Like(b.FullName, $"%{term}%") || EF.Functions.Like(b.Name, $"%{term}%"))
                .OrderBy(b => b.FullName)
                .Take(perTypeLimit)
                .Select(b => new SearchResultDto
                {
                    Type = "Beneficiary",
                    Id = b.BeneficiaryId,
                    Label = b.FullName,
                    Subtitle = b.Status.ToString()
                })
                .ToListAsync();

            var results = new List<SearchResultDto>();
            results.AddRange(donors);
            results.AddRange(campaigns);
            results.AddRange(beneficiaries);

            return Ok(results);
        }
    }
}