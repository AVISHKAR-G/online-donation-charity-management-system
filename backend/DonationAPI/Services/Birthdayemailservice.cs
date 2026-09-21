using System.Globalization;
using System.Net;
using System.Net.Mail;
using DonationAPI.Data;
using DonationAPI.Helpers;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DonationAPI.Services;

/// <summary>
/// Sends one email using the SAME "Email" section of appsettings.json that your
/// existing EmailService uses (EmailSettings: SmtpHost, SmtpPort, SmtpUser,
/// SmtpPassword, EnableSsl, FromEmail, FromName).
/// </summary>
public class BirthdayMailSender
{
    private readonly EmailSettings _settings;

    public BirthdayMailSender(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromEmail, _settings.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword)
        };

        await client.SendMailAsync(message, ct);
    }
}

/// <summary>What a birthday check found and did (returned by the admin "run-now" endpoint).</summary>
public class BirthdayRunResult
{
    public string CheckedAtIst { get; set; } = "";
    public int BirthdaysToday { get; set; }   // users whose birthday is today
    public int Eligible { get; set; }         // ...that are active, have an email, and weren't already emailed this year
    public int Sent { get; set; }
    public List<string> Errors { get; set; } = new();
    public string Note { get; set; } = "";
}

/// <summary>The actual birthday logic. Used by the background job and by the admin test endpoint.</summary>
public class BirthdayRunner
{
    private const int SendHourIst = 8;                       // 8:00 AM India time

    private readonly AppDbContext _db;
    private readonly BirthdayMailSender _mailer;
    private readonly IConfiguration _config;
    private readonly ILogger<BirthdayRunner> _logger;

    public BirthdayRunner(AppDbContext db, BirthdayMailSender mailer, IConfiguration config, ILogger<BirthdayRunner> logger)
    {
        _db = db;
        _mailer = mailer;
        _config = config;
        _logger = logger;
    }

    public async Task<BirthdayRunResult> RunAsync(bool ignoreSendHour, CancellationToken ct)
    {
        var result = new BirthdayRunResult();
        var nowIst = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, GetIndiaTimeZone());
        result.CheckedAtIst = nowIst.ToString("yyyy-MM-dd HH:mm");

        if (!ignoreSendHour && nowIst.Hour < SendHourIst)
        {
            result.Note = $"Waiting: birthday emails are sent from {SendHourIst}:00 AM India time.";
            _logger.LogInformation("Birthday check ({Time} IST): too early, waiting for {Hour}:00.", result.CheckedAtIst, SendHourIst);
            return result;
        }

        int year = nowIst.Year, month = nowIst.Month, day = nowIst.Day;

        // People born on 29 Feb get their greeting on 28 Feb in non-leap years.
        bool includeLeapDay = month == 2 && day == 28 && !DateTime.IsLeapYear(year);

        var todays = await _db.Users
            .Where(u => u.DateOfBirth != null
                     && ((u.DateOfBirth.Value.Month == month && u.DateOfBirth.Value.Day == day)
                         || (includeLeapDay && u.DateOfBirth.Value.Month == 2 && u.DateOfBirth.Value.Day == 29)))
            .ToListAsync(ct);
        result.BirthdaysToday = todays.Count;

        var eligible = todays
            .Where(u => u.IsActive
                     && !string.IsNullOrWhiteSpace(u.Email)
                     && (u.LastBirthdayEmailYear == null || u.LastBirthdayEmailYear < year))
            .ToList();
        result.Eligible = eligible.Count;

        if (todays.Count == 0)
            result.Note = "No user has a birthday today (check that DateOfBirth is saved in the Users table).";
        else if (eligible.Count == 0)
            result.Note = "Birthday users were found, but all were skipped (inactive, no email, or already emailed this year).";

        string donateUrl = (_config["App:FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/') + "/campaigns";

        foreach (var user in eligible)
        {
            // TODO (optional): skip people who opted out — check your email preferences here.
            try
            {
                var (subject, body) = BirthdayEmailTemplate.Build(user.Name, donateUrl);
                await _mailer.SendAsync(user.Email, subject, body, ct);

                user.LastBirthdayEmailYear = year;
                await _db.SaveChangesAsync(ct);              // save per user so one failure doesn't cause repeats
                result.Sent++;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                string reason = ex.InnerException?.Message ?? ex.Message;
                result.Errors.Add($"{user.Email}: {reason}");
                _logger.LogWarning(ex, "Could not send birthday email to user {UserId}. Will retry.", user.UserId);
            }
        }

        _logger.LogInformation(
            "Birthday check ({Time} IST): {Birthdays} birthday(s) today, {Eligible} eligible, {Sent} sent, {Errors} failed.",
            result.CheckedAtIst, result.BirthdaysToday, result.Eligible, result.Sent, result.Errors.Count);

        return result;
    }

    private static TimeZoneInfo GetIndiaTimeZone()
    {
        foreach (var id in new[] { "India Standard Time", "Asia/Kolkata" })   // Windows / Linux ids
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
        }
        return TimeZoneInfo.CreateCustomTimeZone("IST", TimeSpan.FromHours(5.5), "IST", "IST");
    }
}

/// <summary>
/// Runs in the background (like DonationReminderBackgroundService). Checks about 20 seconds
/// after the API starts and then every hour. Emails go out from 8:00 AM India time.
/// LastBirthdayEmailYear guarantees nobody gets the email twice in the same year,
/// even if the API restarts.
/// </summary>
public class BirthdayEmailService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BirthdayEmailService> _logger;

    public BirthdayEmailService(IServiceScopeFactory scopeFactory, ILogger<BirthdayEmailService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            _logger.LogInformation("Birthday email service started. First check in 20 seconds.");
            await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken); // let the app finish starting

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var runner = scope.ServiceProvider.GetRequiredService<BirthdayRunner>();
                    await runner.RunAsync(ignoreSendHour: false, stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Birthday email run failed. Will retry next hour.");
                }

                await Task.Delay(CheckInterval, stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            // normal shutdown
        }
    }
}

/// <summary>The birthday email content (also used by the admin test endpoint).</summary>
public static class BirthdayEmailTemplate
{
    public static (string Subject, string Html) Build(string? fullName, string donateUrl)
    {
        string first = FirstName(fullName);
        string safeFirst = WebUtility.HtmlEncode(first);
        string safeUrl = WebUtility.HtmlEncode(donateUrl);

        string subject = $"Happy Birthday, {first}! 🎂 – HopeCare";

        string html = $@"
<!doctype html>
<html>
<body style=""margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""padding:32px 12px;"">
    <tr><td align=""center"">
      <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0""
             style=""max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;"">
        <tr>
          <td style=""background:#0a5c34;background:linear-gradient(90deg,#0a5c34,#16a34a);padding:26px 32px;color:#ffffff;"">
            <div style=""font-size:22px;font-weight:700;"">HopeCare</div>
            <div style=""font-size:13px;opacity:.85;margin-top:2px;"">Together for a better tomorrow</div>
          </td>
        </tr>
        <tr>
          <td style=""padding:34px 32px 8px;text-align:center;"">
            <div style=""font-size:46px;line-height:1;"">🎂</div>
            <h1 style=""margin:14px 0 0;font-size:26px;color:#065f46;"">Happy Birthday, {safeFirst}!</h1>
          </td>
        </tr>
        <tr>
          <td style=""padding:12px 32px 8px;color:#374151;font-size:15px;line-height:1.65;text-align:center;"">
            Everyone at HopeCare is wishing you a wonderful day and a year full of good things.
            Thank you for being part of a community that is changing lives.
          </td>
        </tr>
        <tr>
          <td align=""center"" style=""padding:22px 32px 34px;"">
            <a href=""{safeUrl}""
               style=""display:inline-block;background:#065f46;color:#ffffff;text-decoration:none;font-weight:700;
                      font-size:15px;padding:13px 28px;border-radius:10px;"">
              Make your birthday count
            </a>
            <div style=""color:#6b7280;font-size:12.5px;margin-top:12px;"">
              Celebrate by supporting a cause close to your heart.
            </div>
          </td>
        </tr>
        <tr>
          <td style=""background:#f9fafb;padding:16px 32px;color:#9ca3af;font-size:12px;text-align:center;"">
            You received this because you added your date of birth to your HopeCare profile.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

        return (subject, html);
    }

    // "AVISHKAR G 7178241112" -> "Avishkar"
    private static string FirstName(string? fullName)
    {
        var first = (fullName ?? "").Trim()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .FirstOrDefault() ?? "Friend";
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(first.ToLower());
    }
}