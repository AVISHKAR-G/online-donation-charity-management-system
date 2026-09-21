using DonationAPI.Data;
using DonationAPI.Models;

namespace DonationAPI.Services
{
    public interface IAiAuditService { Task LogAsync(AiAuditLog entry, CancellationToken ct = default); }

    public class AiAuditService : IAiAuditService
    {
        private readonly AppDbContext _db;
        public AiAuditService(AppDbContext db) => _db = db;

        public async Task LogAsync(AiAuditLog entry, CancellationToken ct = default)
        {
            if (entry.RequestSummary is { Length: > 500 })
                entry.RequestSummary = entry.RequestSummary[..500];
            _db.AiAuditLogs.Add(entry);
            await _db.SaveChangesAsync(ct);
        }
    }
}