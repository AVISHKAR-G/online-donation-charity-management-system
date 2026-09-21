namespace DonationAPI.Services
{
    public enum DetectedDocumentType
    {
        Unknown,
        Aadhar,
        Pan
    }

    public class DocumentValidationResult
    {
        public bool IsValid { get; set; }
        public DetectedDocumentType DetectedType { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public interface IDocumentValidationService
    {
        Task<DocumentValidationResult> ValidateAsync(Stream fileStream, string fileName);
    }
}