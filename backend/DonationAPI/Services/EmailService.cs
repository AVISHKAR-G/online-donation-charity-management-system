using System.Net;
using System.Net.Mail;

namespace DonationAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var host = _config["Smtp:Host"];
                var port = int.Parse(_config["Smtp:Port"] ?? "587");
                var user = _config["Smtp:User"];
                var pass = _config["Smtp:Pass"];
                var fromEmail = _config["Smtp:FromEmail"] ?? user;
                var fromName = _config["Smtp:FromName"] ?? "HopeCare";

                if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user))
                {
                    _logger.LogWarning("SMTP is not configured — skipping email to {ToEmail}", toEmail);
                    return;
                }

                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(user, pass),
                    EnableSsl = true,
                };

                using var message = new MailMessage
                {
                    From = new MailAddress(fromEmail!, fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true,
                };
                message.To.Add(toEmail);

                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Email failures must never break the main transaction (donation, application, etc.)
                _logger.LogError(ex, "Failed to send email to {ToEmail} with subject {Subject}", toEmail, subject);
            }
        }
    }
}