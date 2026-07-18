namespace DonationAPI.Services
{
    public interface IChatbotService
    {
        Task<string> AskAsync(string userMessage);
    }
}