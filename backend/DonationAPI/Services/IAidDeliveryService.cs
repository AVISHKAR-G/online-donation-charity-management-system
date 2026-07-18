using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IAidDeliveryService
    {
        Task<List<AidDeliveryResponseDto>> GetAllAsync();
        Task<AidDeliveryResponseDto?> GetByIdAsync(int id);
        Task<AidDeliveryResponseDto> CreateAsync(CreateAidDeliveryDto dto);
        Task<AidDeliveryResponseDto?> UpdateStatusAsync(int id, UpdateAidDeliveryStatusDto dto);
    }
}