using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto);
        Task<AuthResponseDto> FacebookLoginAsync(FacebookLoginDto dto);
    }
}