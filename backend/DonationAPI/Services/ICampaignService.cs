using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface ICampaignService
    {
        Task<IEnumerable<CampaignResponseDto>> GetAllAsync(string? status = null, string? category = null, string? search = null);
        Task<CampaignResponseDto?> GetByIdAsync(int id);
        Task<CampaignResponseDto> CreateAsync(CampaignCreateDto dto);
        Task<CampaignResponseDto> UpdateAsync(int id, CampaignUpdateDto dto);
        Task DeleteAsync(int id);
        Task<CampaignTransparencyDto> GetTransparencyAsync(int id);   // ← fixed
    }
}