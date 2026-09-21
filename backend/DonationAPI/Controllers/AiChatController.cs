using System.Security.Claims;
using DonationAPI.DTOs;
using DonationAPI.Models;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/ai/chat")]
    [Authorize]
    [EnableRateLimiting("ai")]
    public class AiChatController : ControllerBase
    {
        private readonly IChatbotService _chatbot;
        private readonly IAiAuditService _audit;

        public AiChatController(IChatbotService chatbot, IAiAuditService audit)
        {
            _chatbot = chatbot;
            _audit = audit;
        }

        [HttpPost]
        public async Task<ActionResult<ChatResponseDto>> Ask([FromBody] ChatRequestDto request, CancellationToken ct)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message is required." });

            int? userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
            var role = User.FindFirstValue(ClaimTypes.Role);

            var response = await _chatbot.AskAsync(request, ct);

            var summary = request.Message.Length > 200 ? request.Message[..200] : request.Message;
            await _audit.LogAsync(new AiAuditLog
            {
                UserId = userId,
                Role = role,
                Feature = "chat",
                RequestSummary = summary,
                DataAccessed = response.Sources is { Count: > 0 }
                    ? string.Join(",", response.Sources.Select(s => $"{s.Type}:{s.Id}"))
                    : null,
                Outcome = response.Grounded ? "ok" : "ungrounded",
                Model = "chat-v1"
            }, ct);

            return Ok(response);
        }
    }
}