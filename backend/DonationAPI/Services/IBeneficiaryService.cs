using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IBeneficiaryService
    {
        Task<IEnumerable<BeneficiaryResponseDto>> GetAllAsync();
        Task<BeneficiaryResponseDto> CreateAsync(CreateBeneficiaryDto dto);
        Task<BeneficiaryResponseDto?> UpdateStatusAsync(int id, UpdateBeneficiaryStatusDto dto, int adminUserId);
        Task<bool> DeleteAsync(int id);
    }
}