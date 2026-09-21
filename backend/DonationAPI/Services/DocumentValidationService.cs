using System.Text.RegularExpressions;
using Tesseract;

namespace DonationAPI.Services
{
    public class DocumentValidationService : IDocumentValidationService
    {
        private readonly string _tessDataPath;
        private readonly ILogger<DocumentValidationService> _logger;

        // 12-digit Aadhar number, often shown as "1234 5678 9012"
        private static readonly Regex AadharNumberPattern = new(@"\b\d{4}\s?\d{4}\s?\d{4}\b", RegexOptions.Compiled);

        // PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
        private static readonly Regex PanNumberPattern = new(@"\b[A-Z]{5}\d{4}[A-Z]\b", RegexOptions.Compiled);

        public DocumentValidationService(IWebHostEnvironment env, ILogger<DocumentValidationService> logger)
        {
            _tessDataPath = Path.Combine(env.ContentRootPath, "tessdata");
            _logger = logger;
        }

        public async Task<DocumentValidationResult> ValidateAsync(Stream fileStream, string fileName)
        {
            try
            {
                using var ms = new MemoryStream();
                await fileStream.CopyToAsync(ms);
                var imageBytes = ms.ToArray();

                string extractedText;
                using (var engine = new TesseractEngine(_tessDataPath, "eng", EngineMode.Default))
                using (var img = Pix.LoadFromMemory(imageBytes))
                using (var page = engine.Process(img))
                {
                    extractedText = page.GetText();
                }

                _logger.LogInformation("OCR extracted text length: {Length} chars from {FileName}", extractedText.Length, fileName);

                var upperText = extractedText.ToUpperInvariant();

                var hasAadharKeyword = upperText.Contains("AADHAAR") || upperText.Contains("AADHAR") ||
                                        upperText.Contains("UNIQUE IDENTIFICATION") || upperText.Contains("GOVERNMENT OF INDIA");
                var hasAadharNumber = AadharNumberPattern.IsMatch(extractedText);

                var hasPanKeyword = upperText.Contains("PERMANENT ACCOUNT NUMBER") || upperText.Contains("INCOME TAX DEPARTMENT");
                var hasPanNumber = PanNumberPattern.IsMatch(upperText);

                if (hasAadharKeyword && hasAadharNumber)
                {
                    return new DocumentValidationResult { IsValid = true, DetectedType = DetectedDocumentType.Aadhar, Message = "Aadhar card detected." };
                }

                if (hasPanKeyword || hasPanNumber)
                {
                    return new DocumentValidationResult { IsValid = true, DetectedType = DetectedDocumentType.Pan, Message = "PAN card detected." };
                }

                return new DocumentValidationResult
                {
                    IsValid = false,
                    DetectedType = DetectedDocumentType.Unknown,
                    Message = "This doesn't look like a valid Aadhar or PAN card. Please upload a clear photo/scan of one of these documents."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OCR validation failed for {FileName}", fileName);
                return new DocumentValidationResult
                {
                    IsValid = false,
                    DetectedType = DetectedDocumentType.Unknown,
                    Message = "Could not read the document. Please upload a clearer image (PDF scans are also supported)."
                };
            }
        }
    }
}