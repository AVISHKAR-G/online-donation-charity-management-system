using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DonationAPI.Services
{
    public class GroqLlmClient : ILlmClient
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<GroqLlmClient> _logger;

        public GroqLlmClient(HttpClient http, IConfiguration config, ILogger<GroqLlmClient> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public async Task<string> CompleteAsync(string systemPrompt, string userText, CancellationToken ct = default)
        {
            var apiKey = _config["Groq:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Groq:ApiKey is not configured.");

            var model = _config["Groq:Model"];
            if (string.IsNullOrWhiteSpace(model))
                model = "llama-3.1-8b-instant";

            var payload = new
            {
                model,
                max_tokens = 600,
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userText }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey.Trim());
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                // Log the real reason (invalid key, bad model name, rate limit, etc.)
                _logger.LogError("Groq API error {Status}: {Body}", (int)response.StatusCode, body);
                throw new HttpRequestException($"Groq API error ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return (text ?? "").Trim();
        }
    }
}