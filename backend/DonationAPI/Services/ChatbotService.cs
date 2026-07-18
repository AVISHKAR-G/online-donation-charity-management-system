using System.Text;
using System.Text.Json;
using DonationAPI.Data;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class ChatbotService : IChatbotService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public ChatbotService(HttpClient http, IConfiguration config, AppDbContext context)
        {
            _http = http;
            _config = config;
            _context = context;
        }

        public async Task<string> AskAsync(string userMessage)
        {
            // ---- Live campaign data (grounds real numbers) ----
            var activeCampaigns = await _context.Campaigns
                .Where(c => c.Status == CampaignStatus.Active && c.CollectedAmount < c.TargetAmount)
                .OrderByDescending(c => c.CreatedAt)
                .Take(8)
                .Select(c => new { c.Title, c.TargetAmount, c.CollectedAmount })
                .ToListAsync();

            var campaignSummary = activeCampaigns.Count == 0
                ? "No active campaigns are currently open for donations."
                : string.Join("\n", activeCampaigns.Select(c =>
                    $"- \"{c.Title}\": ₹{c.CollectedAmount:N0} raised of ₹{c.TargetAmount:N0} goal"));

            // ---- Whole-site knowledge ----
            var siteKnowledge = @"
HopeCare is a donation and charity management platform with three account types:

1. DONOR (any signed-up user)
   - Browse & search campaigns on the Campaigns page, view details on a campaign's page.
   - Donate via the Donate page (simulated payment flow), and instantly get an auto-generated receipt.
   - View full donation history and receipts under 'My Activity' / Profile.
   - Apply for assistance (medical, education, food, or disaster relief) via 'Apply for Help', and track application status under 'My Applications'.
   - Get real-time notifications and use this AI chat assistant.
   - View campaign impact via the Impact Report page.
   - Reach the team via the Contact page.

2. ADMIN
   - Create/edit/approve campaigns and beneficiaries.
   - Review donations flagged by the fraud-detection engine (large, rapid, or first-time-large donations are held as 'Pending' instead of auto-approved).
   - Manage users, donors, payments, and view fund-allocation dashboards with charts and CSV export.
   - Review and approve/reject beneficiary assistance applications.

3. VOLUNTEER
   - View assigned aid-delivery tasks for approved assistance applications.
   - Update delivery status (Scheduled → Delivered), record delivery method/notes, and confirm the amount actually delivered to the beneficiary.

Account & login: Users sign up/log in via Register/Login, including Google/Facebook OAuth. JWT keeps sessions secure.

Donation flow: Donation Created → auto-approved if low risk (credited to the campaign immediately, receipt issued) OR flagged for admin review if suspicious → admin clears (credited) or rejects.
";

            var systemPrompt = $@"You are HopeCare's website assistant. Be warm, brief, and helpful.
You can answer questions about anything on the HopeCare website — how to donate, how to apply for assistance, account/roles, the donation review process, contacting the team, etc. — using the site knowledge below. You can also discuss the specific active campaigns listed.

SITE KNOWLEDGE:
{siteKnowledge}

CURRENTLY ACTIVE CAMPAIGNS:
{campaignSummary}

Rules:
- Only answer using the site knowledge and campaign data above — don't invent features, campaign names, amounts, or policies not listed.
- If asked something entirely unrelated to HopeCare (e.g. general trivia, unrelated topics), politely redirect back to how you can help with HopeCare.
- Keep answers under 4-5 sentences unless the user asks for more detail.";

            var apiKey = _config["Groq:ApiKey"];
            var model = _config["Groq:Model"] ?? "llama-3.1-8b-instant";

            var requestBody = new
            {
                model = model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userMessage }
                },
                max_tokens = 350
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions")
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {apiKey}");

            var response = await _http.SendAsync(request);
            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Groq API error: {response.StatusCode} - {raw}");
            }

            using var doc = JsonDocument.Parse(raw);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "Sorry, I couldn't process that.";
        }
    }
}