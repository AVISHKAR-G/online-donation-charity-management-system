using System.Threading.Tasks;
using DonationAPI.DTOs;

namespace DonationAPI.Services
{
    public interface IReportService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
        Task<IEnumerable<CampaignPerformanceDto>> GetCampaignPerformanceAsync();
    }
}