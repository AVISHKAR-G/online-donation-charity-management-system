using System.Text;
using System.Text.Json;

namespace DonationAPI.Services
{
    public class AnthropicLlmClient : ILlmClient
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<AnthropicLlmClient> _logger;

        public AnthropicLlmClient(HttpClient http, IConfiguration config, ILogger<AnthropicLlmClient> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public async Task<string> CompleteAsync(string systemPrompt, string userMessage, CancellationToken ct = default)
        {
            var apiKey = _config["Ai:AnthropicApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Ai:AnthropicApiKey is not configured.");

            var payload = new
            {
                model = "claude-sonnet-4-6",
                max_tokens = 600,
                system = systemPrompt,
                messages = new[] { new { role = "user", content = userMessage } }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
            request.Headers.Add("x-api-key", apiKey);
            request.Headers.Add("anthropic-version", "2023-06-01");
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                // Log the real reason (credit balance, invalid model, bad request, etc.)
                _logger.LogError("Anthropic API error {Status}: {Body}", (int)response.StatusCode, body);
                throw new HttpRequestException($"Anthropic API error ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var textParts = doc.RootElement.GetProperty("content").EnumerateArray()
                .Where(b => b.GetProperty("type").GetString() == "text")
                .Select(b => b.GetProperty("text").GetString() ?? "");

            return string.Join("\n", textParts).Trim();
        }
    }
}