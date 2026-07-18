using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignService _campaignService;

        public CampaignController(ICampaignService campaignService)
        {
            _campaignService = campaignService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? category, [FromQuery] string? search)
        {
            var campaigns = await _campaignService.GetAllAsync(status, category, search);
            return Ok(campaigns);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var campaign = await _campaignService.GetByIdAsync(id);
            return campaign is null ? NotFound() : Ok(campaign);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CampaignCreateDto dto)
        {
            var campaign = await _campaignService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = campaign.CampaignId }, campaign);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CampaignUpdateDto dto)
        {
            try
            {
                var campaign = await _campaignService.UpdateAsync(id, dto);
                return Ok(campaign);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _campaignService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
        [HttpGet("{id}/transparency")]
        public async Task<IActionResult> GetTransparency(int id)
        {
            var result = await _campaignService.GetTransparencyAsync(id);
            return Ok(result);
        }
    }
}
