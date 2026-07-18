using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface INotificationService
    {
        Task CreateAsync(int userId, string title, string message);
        Task<List<NotificationResponseDto>> GetMyNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int notificationId, int userId);
        Task MarkAllAsReadAsync(int userId);
    }
}