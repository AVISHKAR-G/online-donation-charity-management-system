using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;

        public ChatbotController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest("Message is required.");

            try
            {
                var reply = await _chatbotService.AskAsync(dto.Message);
                return Ok(new ChatResponseDto { Reply = reply });
            }
            catch (Exception ex)
            {
                return StatusCode(502, new { error = ex.Message });
            }
        }
    }
}