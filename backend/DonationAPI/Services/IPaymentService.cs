using System.Threading.Tasks;
using System.Collections.Generic;
using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IPaymentService
    {
        Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request);
        Task<VerifyPaymentResponseDto> VerifyPaymentAsync(VerifyPaymentDto dto);
        Task<IEnumerable<PaymentResponseDto>> GetAllAsync();
        Task<bool> DeleteAsync(int id);
    }
}