using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Security.Claims;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DonorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly BirthdayMailSender _mailer;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<DonorController> _logger;

        public DonorController(
            AppDbContext context,
            IMemoryCache cache,
            BirthdayMailSender mailer,
            IWebHostEnvironment env,
            ILogger<DonorController> logger)
        {
            _context = context;
            _cache = cache;
            _mailer = mailer;
            _env = env;
            _logger = logger;
        }

        // Email verification code used to change the password
        private const int PasswordCodeMinutes = 10;        // how long a code stays valid
        private const int PasswordCodeCooldownSeconds = 60; // wait before asking for another code
        private const int MaxCodeAttempts = 5;              // wrong guesses allowed per code

        private sealed class PasswordCodeEntry
        {
            public string CodeHash { get; init; } = string.Empty;
            public DateTime SentAtUtc { get; init; }
            public int Attempts { get; set; }
        }

        private static string PasswordCodeKey(int userId) => $"pwd-change-code:{userId}";

        private static readonly string[] AllowedGenders = { "Male", "Female", "Other", "Prefer not to say" };

        private static string? Clean(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        // GET /api/donor?search=&role filter handled client-side; admin only
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(u => u.Name.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
            }

            var donors = await query
                .Select(u => new DonorListDto
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    TotalDonated = _context.Donations
                        .Where(d => d.UserId == u.UserId && d.Payment != null && d.Payment.Status == PaymentStatus.Success)
                        .Sum(d => (decimal?)d.Amount) ?? 0,
                    TotalTransactions = _context.Donations
                        .Count(d => d.UserId == u.UserId)
                })
                .OrderByDescending(d => d.TotalDonated)
                .ToListAsync();

            return Ok(donors);
        }

        // PUT /api/donor/{id}/deactivate
        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();

            user.IsActive = !user.IsActive; // toggles active/inactive
            await _context.SaveChangesAsync();
            return Ok(new { user.UserId, user.IsActive });
        }

        // GET /api/donor/me — logged-in donor's own profile
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            return Ok(await BuildProfileAsync(user));
        }

        // PUT /api/donor/me — update own profile
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile(DonorUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            user.Name = dto.Name.Trim();

            // Email: only change it if it's different, and never to one another account already uses
            var newEmail = dto.Email.Trim();
            if (!string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
            {
                bool taken = await _context.Users.AnyAsync(u => u.Email == newEmail && u.UserId != userId);
                if (taken) return Conflict(new { message = "That email is already in use." });
                user.Email = newEmail;
            }

            // Phone: only touched when the client sends it
            if (dto.Phone != null)
                user.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();

            // Date of birth (used for the birthday email): only touched when the client sends it
            if (dto.Dob.HasValue)
            {
                var dob = dto.Dob.Value.Date;
                // +1 day tolerance so "today" in India is accepted while the server clock is still on UTC
                if (dob > DateTime.UtcNow.Date.AddDays(1) || dob.Year < 1900)
                    return BadRequest(new { message = "Enter a valid date of birth." });

                user.DateOfBirth = dob;
            }

            // Optional details — each is only touched when the client sends it (an empty string clears it)
            if (dto.Gender != null)
            {
                var gender = Clean(dto.Gender);
                if (gender != null && !AllowedGenders.Contains(gender))
                    return BadRequest(new { message = "Choose a valid gender option." });
                user.Gender = gender;
            }

            if (dto.Address != null) user.Address = Clean(dto.Address);
            if (dto.City != null) user.City = Clean(dto.City);
            if (dto.State != null) user.State = Clean(dto.State);

            if (dto.Pincode != null)
            {
                var pin = Clean(dto.Pincode);
                if (pin != null && !Regex.IsMatch(pin, @"^\d{6}$"))
                    return BadRequest(new { message = "Pincode must be 6 digits." });
                user.Pincode = pin;
            }

            if (dto.ProfilePicture != null)
            {
                var pic = dto.ProfilePicture.Trim();
                if (pic.Length == 0)
                    user.ProfilePicture = null;
                else if (!pic.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Profile picture must be an image." });
                else
                    user.ProfilePicture = pic;
            }

            await _context.SaveChangesAsync();

            // Return a safe DTO — NOT the User entity (that would expose PasswordHash)
            return Ok(await BuildProfileAsync(user));
        }

        // POST /api/donor/me/password/send-code — email a 6-digit verification code to the logged-in donor
        [HttpPost("me/password/send-code")]
        public async Task<IActionResult> SendPasswordCode(CancellationToken ct)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(new object[] { userId }, ct);
            if (user is null) return NotFound();
            if (string.IsNullOrWhiteSpace(user.Email))
                return BadRequest(new { message = "Your account has no email address." });

            var key = PasswordCodeKey(userId);

            // Stop people from spamming the send button
            if (_cache.TryGetValue(key, out PasswordCodeEntry? existing) && existing is not null)
            {
                int wait = PasswordCodeCooldownSeconds - (int)(DateTime.UtcNow - existing.SentAtUtc).TotalSeconds;
                if (wait > 0)
                    return StatusCode(StatusCodes.Status429TooManyRequests,
                        new { message = $"Please wait {wait} seconds before requesting another code." });
            }

            var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            _cache.Set(key, new PasswordCodeEntry
            {
                CodeHash = BCrypt.Net.BCrypt.HashPassword(code),
                SentAtUtc = DateTime.UtcNow,
                Attempts = 0
            }, TimeSpan.FromMinutes(PasswordCodeMinutes));

            // Development only: print the code so you can test even if Gmail is not set up yet
            if (_env.IsDevelopment())
                _logger.LogWarning("DEV ONLY: password change code for {Email} is {Code}", user.Email, code);

            try
            {
                await _mailer.SendAsync(user.Email, "Your HopeCare verification code", BuildCodeEmail(user.Name, code), ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Could not send the password code email to user {UserId}.", userId);

                if (_env.IsDevelopment())
                    return Ok(new
                    {
                        message = "The email could not be sent (check the Email settings). Development mode: the code is printed in the API console.",
                        expiresInMinutes = PasswordCodeMinutes
                    });

                _cache.Remove(key);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "We could not send the email right now. Please try again later." });
            }

            return Ok(new { message = "Verification code sent.", expiresInMinutes = PasswordCodeMinutes });
        }

        // PUT /api/donor/me/password — set a new password.
        // Normal way: send the CURRENT password. Forgot password: send the emailed CODE instead.
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangeMyPassword(DonorChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            var newPassword = dto.NewPassword ?? string.Empty;
            if (newPassword.Length < 8 || !newPassword.Any(char.IsLetter) || !newPassword.Any(char.IsDigit))
                return BadRequest(new { message = "Password must be at least 8 characters and include a letter and a number." });

            bool hasPassword = !string.IsNullOrEmpty(user.PasswordHash);
            var code = (dto.Code ?? string.Empty).Trim();
            var codeKey = PasswordCodeKey(userId);
            var failKey = $"pwd-change-fail:{userId}";

            if (code.Length > 0)
            {
                // ---- Forgot password: verify the emailed code ----
                if (!_cache.TryGetValue(codeKey, out PasswordCodeEntry? entry) || entry is null)
                    return BadRequest(new { message = "This code has expired or was not requested. Please request a new code." });

                if (!BCrypt.Net.BCrypt.Verify(code, entry.CodeHash))
                {
                    entry.Attempts++;
                    if (entry.Attempts >= MaxCodeAttempts)
                    {
                        _cache.Remove(codeKey);
                        return BadRequest(new { message = "Too many wrong attempts. Please request a new code." });
                    }
                    return BadRequest(new { message = $"Incorrect verification code. {MaxCodeAttempts - entry.Attempts} attempt(s) left." });
                }
            }
            else
            {
                // ---- Normal change: check the current password ----
                if (!hasPassword)
                    return BadRequest(new { message = "Your account has no password yet. Click \"Forgot password?\" to set one with an email code." });

                _cache.TryGetValue(failKey, out int fails);
                if (fails >= MaxCodeAttempts)
                    return StatusCode(StatusCodes.Status429TooManyRequests,
                        new { message = "Too many wrong attempts. Please wait 15 minutes, or click \"Forgot password?\"." });

                if (string.IsNullOrEmpty(dto.CurrentPassword) ||
                    !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                {
                    _cache.Set(failKey, fails + 1, TimeSpan.FromMinutes(15));
                    return BadRequest(new { message = "Current password is incorrect." });
                }
            }

            // Do not allow the same password again
            if (hasPassword && BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash))
                return BadRequest(new { message = "New password must be different from your current password." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
            _cache.Remove(codeKey); // a code works only once
            _cache.Remove(failKey);

            return Ok(new { message = "Password changed successfully." });
        }

        private static string BuildCodeEmail(string? fullName, string code)
        {
            var first = (fullName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "there";
            var safeFirst = WebUtility.HtmlEncode(first);
            return $@"
<!doctype html>
<html>
<body style=""margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""padding:32px 12px;"">
    <tr><td align=""center"">
      <table role=""presentation"" width=""520"" cellpadding=""0"" cellspacing=""0""
             style=""max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;"">
        <tr>
          <td style=""background:#0a5c34;background:linear-gradient(90deg,#0a5c34,#16a34a);padding:24px 32px;color:#ffffff;"">
            <div style=""font-size:22px;font-weight:700;"">HopeCare</div>
            <div style=""font-size:13px;opacity:.85;margin-top:2px;"">Password change request</div>
          </td>
        </tr>
        <tr>
          <td style=""padding:30px 32px 8px;color:#374151;font-size:15px;line-height:1.6;"">
            Hi {safeFirst},<br /><br />
            Use this code to change your HopeCare password:
          </td>
        </tr>
        <tr>
          <td align=""center"" style=""padding:8px 32px 8px;"">
            <div style=""display:inline-block;background:#ecfdf5;color:#065f46;font-size:34px;font-weight:800;letter-spacing:8px;padding:14px 26px;border-radius:12px;"">{code}</div>
          </td>
        </tr>
        <tr>
          <td style=""padding:12px 32px 28px;color:#6b7280;font-size:13.5px;line-height:1.6;text-align:center;"">
            This code expires in {PasswordCodeMinutes} minutes.<br />
            If you did not ask for this, you can ignore this email. Your password will not change.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }

        private async Task<DonorProfileDto> BuildProfileAsync(User user)
        {
            return new DonorProfileDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Dob = user.DateOfBirth,
                Gender = user.Gender,
                Address = user.Address,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                ProfilePicture = user.ProfilePicture,
                MemberSince = user.CreatedAt,
                TotalDonated = await _context.Donations
                    .Where(d => d.UserId == user.UserId && d.Payment != null && d.Payment.Status == PaymentStatus.Success)
                    .SumAsync(d => (decimal?)d.Amount) ?? 0,
                TotalTransactions = await _context.Donations.CountAsync(d => d.UserId == user.UserId)
            };
        }
    }
}