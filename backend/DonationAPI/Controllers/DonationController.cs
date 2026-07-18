using System.Security.Claims;
using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DonationController : ControllerBase
    {
        private readonly IDonationService _donationService;

        public DonationController(IDonationService donationService)
        {
            _donationService = donationService;
        }

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        public async Task<IActionResult> Create(DonationCreateDto dto)
        {
            var result = await _donationService.CreateDonationAsync(CurrentUserId, dto);
            return CreatedAtAction(nameof(GetById), new { id = result.DonationId }, result);
        }

        [HttpGet("my-donations")]
        public async Task<IActionResult> GetMyDonations()
        {
            var result = await _donationService.GetByUserAsync(CurrentUserId);
            return Ok(result);
        }

        [HttpGet("recent-public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecentPublic()
        {
            var result = await _donationService.GetRecentPublicAsync(15);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _donationService.GetByIdAsync(id);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _donationService.GetAllAsync();
            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateDonationStatusDto dto)
        {
            var result = await _donationService.UpdateStatusAsync(id, dto);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _donationService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
        [HttpPost("send-urgent-campaign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendUrgentCampaign(UrgentCampaignEmailDto dto)
        {
            var count = await _donationService.SendUrgentCampaignEmailAsync(dto);
            return Ok(new { message = $"Urgent campaign email sent to {count} donor(s).", count });
        }
    }
}