using System.Net;
using System.Net.Mail;
using DonationAPI.Helpers;
using Microsoft.Extensions.Options;

namespace DonationAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<bool> SendAsync(string toEmail, string toName, string subject, string bodyHtml)
        {
            if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
            {
                _logger.LogWarning("Email not sent to {Email} — SMTP is not configured (see appsettings.json 'Email' section).", toEmail);
                return false;
            }

            try
            {
                using var message = new MailMessage
                {
                    From = new MailAddress(_settings.FromEmail, _settings.FromName),
                    Subject = subject,
                    Body = bodyHtml,
                    IsBodyHtml = true,
                };
                message.To.Add(new MailAddress(toEmail, toName));

                using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
                {
                    EnableSsl = _settings.EnableSsl,
                    Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword),
                    Timeout = 10000, // 10s instead of the ~100s default — fails fast if SMTP is unreachable
                };

                await client.SendMailAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        public Task<bool> SendAsync(string toEmail, string toName, string subject)
        {
            var bodyHtml = $"<p style=\"font-family:'Segoe UI',Roboto,Arial,sans-serif;\">{WebUtility.HtmlEncode(subject)}</p>";
            return SendAsync(toEmail, toName, subject, bodyHtml);
        }

        public async Task<int> SendBulkAsync(IEnumerable<(string Email, string Name)> recipients, string subject, string bodyHtml)
        {
            // Send with limited concurrency instead of one-at-a-time, so a slow/misconfigured
            // SMTP server doesn't multiply its delay by the number of donors.
            const int maxConcurrency = 5;
            using var semaphore = new SemaphoreSlim(maxConcurrency);
            var sentCount = 0;
            var sentLock = new object();

            var tasks = recipients.Select(async r =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var ok = await SendAsync(r.Email, r.Name, subject, bodyHtml);
                    if (ok)
                    {
                        lock (sentLock) { sentCount++; }
                    }
                }
                finally
                {
                    semaphore.Release();
                }
            });

            await Task.WhenAll(tasks);
            return sentCount;
        }
    }
}