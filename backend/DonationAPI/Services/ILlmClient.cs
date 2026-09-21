namespace DonationAPI.Services
{
    public interface ILlmClient
    {
        Task<string> CompleteAsync(string systemPrompt, string userText, CancellationToken ct = default);
    }
}