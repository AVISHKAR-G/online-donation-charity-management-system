namespace DonationAPI.DTOs
{
    public class DonorListDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal TotalDonated { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class DonorProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal TotalDonated { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class DonorUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}