using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IDonationService
    {
        Task<DonationResponseDto> CreateDonationAsync(int userId, DonationCreateDto dto);
        Task<DonationResponseDto?> UpdateStatusAsync(int id, UpdateDonationStatusDto dto);
        Task<IEnumerable<DonationResponseDto>> GetAllAsync();
        Task<IEnumerable<DonationResponseDto>> GetByUserAsync(int userId);
        Task<DonationResponseDto?> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<DonationResponseDto>> GetRecentPublicAsync(int count);
        Task<int> SendUrgentCampaignEmailAsync(UrgentCampaignEmailDto dto);
    }
}