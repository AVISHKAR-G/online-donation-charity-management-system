using System.Text;
using System.Text.Json;

namespace DonationAPI.Services
{
    // Expected interface (already used by ChatbotService). If your project does not
    // define it yet, add it in its own file:
    //
    // public interface ILlmClient
    // {
    //     Task<string> CompleteAsync(string systemPrompt, string userText, CancellationToken ct = default);
    // }

    public class LlmClient : ILlmClient
    {
        private readonly HttpClient _http;
        private readonly string? _apiKey;
        private readonly string _model;
        private readonly int _maxTokens;

        public LlmClient(HttpClient http, IConfiguration config)
        {
            _http = http;
            _http.BaseAddress = new Uri(config["Llm:BaseUrl"] ?? "https://api.groq.com/openai/");
            _http.Timeout = TimeSpan.FromSeconds(30);

            _apiKey = config["Llm:ApiKey"];
            _model = config["Llm:Model"] ?? "llama-3.3-70b-versatile";
            _maxTokens = int.TryParse(config["Llm:MaxTokens"], out var mt) ? mt : 800;
        }

        public async Task<string> CompleteAsync(string systemPrompt, string userText, CancellationToken ct = default)
        {
            // Checked here (not in the constructor) so ChatbotService's try/catch
            // turns a missing key into a friendly error message instead of a 500.
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException("Llm:ApiKey is not configured.");

            var payload = new
            {
                model = _model,
                max_tokens = _maxTokens,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userText }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"LLM request failed with status {(int)response.StatusCode}.");

            using var doc = JsonDocument.Parse(body);
            var reply = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString()
                ?.Trim() ?? "";

            if (reply.Length == 0)
                throw new InvalidOperationException("LLM returned an empty response.");
            return reply;
        }
    }
}