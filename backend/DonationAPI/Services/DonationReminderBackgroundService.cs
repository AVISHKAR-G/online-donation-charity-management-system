using DonationAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class DonationReminderBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<DonationReminderBackgroundService> _logger;

        // How often the reminder should repeat per user
        private static readonly TimeSpan ReminderInterval = TimeSpan.FromDays(10);

        // How often this background loop wakes up to check
        private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(6);

        public DonationReminderBackgroundService(
            IServiceProvider services,
            ILogger<DonationReminderBackgroundService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SendDueRemindersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Donation reminder background job failed");
                }

                await Task.Delay(CheckInterval, stoppingToken);
            }
        }

        private async Task SendDueRemindersAsync(CancellationToken stoppingToken)
        {
            using var scope = _services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var cutoff = DateTime.UtcNow - ReminderInterval;

            var dueUsers = await context.Users
                .Where(u => u.IsActive)
                .Where(u => u.LastDonationReminderSentAt == null || u.LastDonationReminderSentAt <= cutoff)
                .ToListAsync(stoppingToken);

            if (dueUsers.Count == 0)
            {
                _logger.LogInformation("Donation reminder check: no users due.");
                return;
            }

            const string title = "We miss you!";
            const string message = "It's been a while — your support can change a life today. Consider making a donation.";
            const string emailSubject = "A gentle reminder from HopeCare 💙";
            const string emailBodyHtml = "<p style=\"font-family:'Segoe UI',Roboto,Arial,sans-serif;\">" +
                "Hi there,<br/><br/>" +
                "It's been a little while since we last heard from you. Every donation, big or small, " +
                "helps us continue supporting people in need.<br/><br/>" +
                "<a href=\"https://your-site-url.com/campaigns\" style=\"color:#2563eb;font-weight:600;\">" +
                "See active campaigns →</a><br/><br/>" +
                "Thank you for being part of our community.<br/>— HopeCare</p>";

            foreach (var user in dueUsers)
            {
                // NOTE: uses user.UserId — change this to match your actual primary key
                // property name on the User model if it's different (e.g. user.Id)
                await notificationService.CreateAsync(user.UserId, title, message);
                await emailService.SendAsync(user.Email, user.Name, emailSubject, emailBodyHtml);

                user.LastDonationReminderSentAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Donation reminder sent to {Count} users.", dueUsers.Count);
        }
    }
}