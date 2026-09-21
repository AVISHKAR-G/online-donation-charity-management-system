namespace DonationAPI.DTOs
{
    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;

        // Optional conversation history for context-aware replies.
        // Existing callers that only send { message } still work fine.
        public List<ChatTurnDto> History { get; set; } = new();

        public string? Lang { get; set; } // e.g. "en-US", "ta-IN", "hi-IN"
    }

    public class ChatTurnDto
    {
        public string Role { get; set; } = string.Empty; // "user" | "bot"
        public string Text { get; set; } = string.Empty;
    }

    public class ChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;

        // What verified data (if any) backs this answer, so the
        // frontend can show "Sources: ..." under the reply.
        public List<ChatSourceDto> Sources { get; set; } = new();

        // False when nothing in the DB matched and the answer is
        // general rather than grounded in specific records.
        public bool Grounded { get; set; }
    }

    public class ChatSourceDto
    {
        public string Type { get; set; } = string.Empty; // "campaign" | "faq"
        public string Label { get; set; } = string.Empty;
        public int? Id { get; set; }
    }
}