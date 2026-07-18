using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IContactService
    {
        Task<ContactMessageResponseDto> SubmitAsync(ContactMessageCreateDto dto);
        Task<IEnumerable<ContactMessageResponseDto>> GetAllAsync();
    }
}