using DonationAPI.Data;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(int userId, string action, string description, string? context = null);
        Task<List<ActivityLog>> GetRecentAsync(int userId, int take = 50);
    }

    // NOTE: assumes your DbContext class is named AppDbContext, matching the
    // rest of this project (see AppDbContextModelSnapshot.cs). Adjust the
    // constructor parameter type if yours differs.
    public class ActivityLogService : IActivityLogService
    {
        private readonly AppDbContext _db;

        public ActivityLogService(AppDbContext db)
        {
            _db = db;
        }

        public async Task LogAsync(int userId, string action, string description, string? context = null)
        {
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Action = action,
                Description = description,
                Context = context,
                CreatedAt = DateTime.UtcNow,
            });
            await _db.SaveChangesAsync();
        }

        public async Task<List<ActivityLog>> GetRecentAsync(int userId, int take = 50)
        {
            return await _db.ActivityLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(take)
                .ToListAsync();
        }
    }
}