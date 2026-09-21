using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IChatbotService
    {
        Task<ChatResponseDto> AskAsync(ChatRequestDto request, CancellationToken ct = default);
    }
}