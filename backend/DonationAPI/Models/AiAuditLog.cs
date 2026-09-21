namespace DonationAPI.Models
{
    public class AiAuditLog
    {
        public long Id { get; set; }
        public int? UserId { get; set; }            // no FK on purpose: audit rows must survive user deletion
        public string? Role { get; set; }
        public string Feature { get; set; } = "";   // chat, search, agent, ...
        public string? RequestSummary { get; set; } // truncated, no sensitive data
        public string? ToolUsed { get; set; }
        public string? DataAccessed { get; set; }
        public string Outcome { get; set; } = "ok"; // ok | error | blocked
        public string? Model { get; set; }
        public string? ReviewState { get; set; }    // for human approve/reject later
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}