using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UrgentCampaignController : ControllerBase
    {
        private readonly IUrgentCampaignService _urgentCampaignService;

        public UrgentCampaignController(IUrgentCampaignService urgentCampaignService)
        {
            _urgentCampaignService = urgentCampaignService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send(SendUrgentCampaignDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Subject and message are required." });

            var result = await _urgentCampaignService.SendToAllDonorsAsync(dto);
            return Ok(result);
        }
    }
}