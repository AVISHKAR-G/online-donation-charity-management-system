namespace DonationAPI.Services
{
    public interface IEmailService
    {
        /// <summary>
        /// Sends one email. Returns true if it was sent successfully, false otherwise
        /// (never throws — callers doing bulk sends need to keep going on individual failures).
        /// </summary>
        Task<bool> SendAsync(string toEmail, string toName, string subject, string bodyHtml);

        /// <summary>
        /// Convenience overload for callers that only have a subject/short message and
        /// no separate HTML body — the subject is used as the body too.
        /// </summary>
        Task<bool> SendAsync(string toEmail, string toName, string subject);

        /// <summary>
        /// Sends the same subject/body to many recipients, one at a time, tolerating
        /// individual failures. Returns how many were sent successfully.
        /// </summary>
        Task<int> SendBulkAsync(IEnumerable<(string Email, string Name)> recipients, string subject, string bodyHtml);
    }
}