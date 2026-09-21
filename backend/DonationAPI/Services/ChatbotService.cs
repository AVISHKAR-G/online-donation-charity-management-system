using DonationAPI.Data;
using DonationAPI.DTOs;
using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Services
{
    public class ChatbotService : IChatbotService
    {
        private readonly AppDbContext _db;
        private readonly ILlmClient _llm;
        private readonly ILogger<ChatbotService> _logger;

        private const int MaxMessageLength = 1000;
        private const int MaxHistoryTurns = 8;

        private static readonly Dictionary<string, string> LangNames = new()
        {
            ["en-US"] = "English",
            ["hi-IN"] = "Hindi",
            ["ta-IN"] = "Tamil",
            ["te-IN"] = "Telugu",
            ["ml-IN"] = "Malayalam",
            ["kn-IN"] = "Kannada",
        };

        public ChatbotService(AppDbContext db, ILlmClient llm, ILogger<ChatbotService> logger)
        {
            _db = db;
            _llm = llm;
            _logger = logger;
        }

        public async Task<ChatResponseDto> AskAsync(ChatRequestDto request, CancellationToken ct = default)
        {
            var message = (request.Message ?? "").Trim();
            if (string.IsNullOrEmpty(message))
                return new ChatResponseDto { Reply = "Could you type a question first?", Grounded = false };

            if (message.Length > MaxMessageLength)
                message = message[..MaxMessageLength];

            var languageName = LangNames.TryGetValue(request.Lang ?? "en-US", out var name) ? name : "English";

            var keywords = ExtractKeywords(message);

            var campaigns = await FindRelevantCampaignsAsync(keywords, ct);
            var faqs = await FindRelevantFaqsAsync(keywords, ct);

            var sources = new List<ChatSourceDto>();
            sources.AddRange(campaigns.Select(c => new ChatSourceDto { Type = "campaign", Label = c.Title, Id = c.CampaignId }));
            sources.AddRange(faqs.Select(f => new ChatSourceDto { Type = "faq", Label = f.Question, Id = f.Id }));

            var contextBlock = BuildContextBlock(campaigns, faqs);
            var systemPrompt = BuildSystemPrompt(contextBlock, languageName);
            var conversationText = BuildConversationText(request.History, message);

            string reply;
            try
            {
                reply = await _llm.CompleteAsync(systemPrompt, conversationText, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LLM call failed");
                return new ChatResponseDto
                {
                    Reply = "I'm having trouble reaching the assistant service right now. Please try again shortly, or contact support.",
                    Grounded = false,
                    Sources = new List<ChatSourceDto>()
                };
            }

            return new ChatResponseDto
            {
                Reply = reply,
                Sources = sources,
                Grounded = sources.Count > 0
            };
        }

        private static List<string> ExtractKeywords(string message)
        {
            var stopWords = new HashSet<string> { "the", "a", "an", "is", "are", "how", "do", "i", "to", "for", "of", "and", "in", "on", "what", "can", "you", "my" };
            return message.ToLowerInvariant()
                .Split(new[] { ' ', ',', '.', '?', '!' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 2 && !stopWords.Contains(w))
                .Distinct().Take(8).ToList();
        }

        private async Task<List<Campaign>> FindRelevantCampaignsAsync(List<string> keywords, CancellationToken ct)
        {
            if (keywords.Count == 0) return new List<Campaign>();

            var query = _db.Campaigns.Where(c => c.Status == CampaignStatus.Active).AsQueryable();

            var predicate = PredicateBuilder<Campaign>.False();
            foreach (var kw in keywords)
            {
                var k = kw;
                predicate = predicate.Or(c =>
                    EF.Functions.Like(c.Title, $"%{k}%") ||
                    (c.Category != null && EF.Functions.Like(c.Category, $"%{k}%")) ||
                    EF.Functions.Like(c.Description, $"%{k}%"));
            }

            return await query.Where(predicate).OrderBy(c => c.CampaignId).Take(5).ToListAsync(ct);
        }

        private async Task<List<FaqEntry>> FindRelevantFaqsAsync(List<string> keywords, CancellationToken ct)
        {
            var query = _db.FaqEntries.Where(f => f.IsPublished);
            if (keywords.Count == 0)
                return await query.OrderBy(f => f.Id).Take(3).ToListAsync(ct);

            var predicate = PredicateBuilder<FaqEntry>.False();
            foreach (var kw in keywords)
            {
                var k = kw;
                predicate = predicate.Or(f =>
                    EF.Functions.Like(f.Question, $"%{k}%") ||
                    EF.Functions.Like(f.Answer, $"%{k}%") ||
                    EF.Functions.Like(f.Category, $"%{k}%"));
            }
            return await query.Where(predicate).OrderBy(f => f.Id).Take(3).ToListAsync(ct);
        }

        private static string BuildContextBlock(List<Campaign> campaigns, List<FaqEntry> faqs)
        {
            if (campaigns.Count == 0 && faqs.Count == 0)
                return "(No matching campaigns or FAQ entries were found in the database for this question.)";

            var sb = new System.Text.StringBuilder();
            if (campaigns.Count > 0)
            {
                sb.AppendLine("VERIFIED CAMPAIGN DATA:");
                foreach (var c in campaigns)
                    sb.AppendLine($"- \"{c.Title}\" (id {c.CampaignId}, category: {c.Category ?? "uncategorized"}, target: {c.TargetAmount}, collected: {c.CollectedAmount}, {c.PercentageCompleted}% funded, status: {c.Status}): {Truncate(c.Description, 300)}");
            }
            if (faqs.Count > 0)
            {
                sb.AppendLine("VERIFIED FAQ ENTRIES:");
                foreach (var f in faqs)
                    sb.AppendLine($"- Q: {f.Question}\n  A: {f.Answer}");
            }
            return sb.ToString();
        }

        private static string Truncate(string? s, int max) =>
            string.IsNullOrEmpty(s) ? "" : (s.Length <= max ? s : s[..max] + "...");

        private static string BuildSystemPrompt(string contextBlock, string languageName) => $@"You are HopeCare's website assistant, helping donors, volunteers, and applicants.

Rules you must always follow:
1. Only state facts that appear in the VERIFIED DATA block below. Never invent campaign names, amounts, dates, policies, or outcomes.
2. If the verified data does not answer the question, say plainly that you don't have that information, and suggest contacting support or checking the relevant page.
3. Clearly distinguish general guidance from specific verified facts.
4. Do not make decisions or claims about fraud, account suspension, charity verification, or fund allocation — tell the user those require review by a team member.
5. Keep answers concise and friendly. Use plain text, no markdown tables.
6. Respond in {languageName}, regardless of what language the user's question is written in. Do not translate campaign names, numbers, or amounts — keep those as-is.

VERIFIED DATA:
{contextBlock}";

        private static string BuildConversationText(List<ChatTurnDto> history, string latestMessage)
        {
            if (history == null || history.Count == 0) return latestMessage;

            var sb = new System.Text.StringBuilder();
            foreach (var turn in history.TakeLast(MaxHistoryTurns))
                sb.AppendLine($"{(turn.Role == "user" ? "User" : "Assistant")}: {turn.Text}");
            sb.AppendLine($"User: {latestMessage}");
            return sb.ToString();
        }
    }

    internal static class PredicateBuilder<T>
    {
        public static System.Linq.Expressions.Expression<Func<T, bool>> False() => f => false;
    }

    internal static class PredicateExtensions
    {
        public static System.Linq.Expressions.Expression<Func<T, bool>> Or<T>(
            this System.Linq.Expressions.Expression<Func<T, bool>> expr1,
            System.Linq.Expressions.Expression<Func<T, bool>> expr2)
        {
            var parameter = System.Linq.Expressions.Expression.Parameter(typeof(T));
            var body = System.Linq.Expressions.Expression.OrElse(
                System.Linq.Expressions.Expression.Invoke(expr1, parameter),
                System.Linq.Expressions.Expression.Invoke(expr2, parameter));
            return System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(body, parameter);
        }
    }
}