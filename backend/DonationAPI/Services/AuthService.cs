using System.Net.Http.Json;
using System.Text.Json.Serialization;
using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Helpers;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtHelper _jwtHelper;
        private readonly INotificationService _notificationService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IUrgentCampaignService _urgentCampaignService;

        public AuthService(
            AppDbContext context,
            JwtHelper jwtHelper,
            INotificationService notificationService,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IUrgentCampaignService urgentCampaignService)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _notificationService = notificationService;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _urgentCampaignService = urgentCampaignService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException("Email is already registered.");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Donor
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await NotifyAdminsOfNewUser(user);
            await SendUrgentCampaignToNewUser(user);

            var token = _jwtHelper.GenerateToken(user);
            return BuildResponse(user, token);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid email or password.");

            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("This account has been deactivated.");

            var token = _jwtHelper.GenerateToken(user);
            return BuildResponse(user, token);
        }

        public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={dto.IdToken}");

            if (!response.IsSuccessStatusCode)
                throw new UnauthorizedAccessException("Invalid Google token.");

            var payload = await response.Content.ReadFromJsonAsync<GoogleTokenInfo>();
            var expectedClientId = _configuration["Authentication:Google:ClientId"];

            if (payload == null || string.IsNullOrEmpty(payload.Email) || payload.Aud != expectedClientId)
                throw new UnauthorizedAccessException("Google token validation failed.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Sub);
            var isNewUser = false;

            if (user == null)
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user != null)
                {
                    // Existing email/password account — link Google to it
                    user.GoogleId = payload.Sub;
                }
                else
                {
                    user = new User
                    {
                        Name = payload.Name ?? payload.Email,
                        Email = payload.Email,
                        GoogleId = payload.Sub,
                        PasswordHash = null,
                        Role = UserRole.Donor
                    };
                    _context.Users.Add(user);
                    isNewUser = true;
                }

                await _context.SaveChangesAsync();

                if (isNewUser)
                {
                    await NotifyAdminsOfNewUser(user);
                    await SendUrgentCampaignToNewUser(user);
                }
            }

            if (!user.IsActive)
                throw new UnauthorizedAccessException("This account has been deactivated.");

            var token = _jwtHelper.GenerateToken(user);
            return BuildResponse(user, token);
        }

        public async Task<AuthResponseDto> FacebookLoginAsync(FacebookLoginDto dto)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(
                $"https://graph.facebook.com/me?fields=id,name,email&access_token={dto.AccessToken}");

            if (!response.IsSuccessStatusCode)
                throw new UnauthorizedAccessException("Invalid Facebook token.");

            var payload = await response.Content.ReadFromJsonAsync<FacebookUserInfo>();

            if (payload == null || string.IsNullOrEmpty(payload.Email))
                throw new UnauthorizedAccessException("Facebook account has no email permission granted.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.FacebookId == payload.Id);

            if (user == null)
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user != null)
                {
                    user.FacebookId = payload.Id;
                }
                else
                {
                    user = new User
                    {
                        Name = payload.Name ?? payload.Email,
                        Email = payload.Email,
                        FacebookId = payload.Id,
                        PasswordHash = null,
                        Role = UserRole.Donor
                    };
                    _context.Users.Add(user);
                }

                await _context.SaveChangesAsync();
                await NotifyAdminsOfNewUser(user);
                await SendUrgentCampaignToNewUser(user);
            }

            if (!user.IsActive)
                throw new UnauthorizedAccessException("This account has been deactivated.");

            var token = _jwtHelper.GenerateToken(user);
            return BuildResponse(user, token);
        }

        private async Task NotifyAdminsOfNewUser(User user)
        {
            var adminIds = await _context.Users
                .Where(u => u.Role == UserRole.Admin)
                .Select(u => u.UserId)
                .ToListAsync();

            foreach (var adminId in adminIds)
            {
                await _notificationService.CreateAsync(
                    adminId,
                    "New User Joined",
                    $"{user.Name} ({user.Email}) just registered on HopeCare."
                );
            }
        }

        private async Task SendUrgentCampaignToNewUser(User user)
        {
            // If there's an active urgent appeal, send it to the new signup too.
            // Wrapped so a mail/SMTP hiccup never blocks registration/login.
            try
            {
                await _urgentCampaignService.SendActiveCampaignToNewUserAsync(user);
            }
            catch (Exception)
            {
                // Already logged inside the email service.
            }
        }

        private static AuthResponseDto BuildResponse(User user, string token) => new()
        {
            Token = token,
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        };

        private class GoogleTokenInfo
        {
            [JsonPropertyName("aud")]
            public string Aud { get; set; } = string.Empty;

            [JsonPropertyName("sub")]
            public string Sub { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string? Name { get; set; }
        }

        private class FacebookUserInfo
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("email")]
            public string? Email { get; set; }
        }
    }
}