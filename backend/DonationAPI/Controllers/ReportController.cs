using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DonationAPI.Services;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var summary = await _reportService.GetDashboardSummaryAsync();
            return Ok(summary);
        }

        [HttpGet("campaign-performance")]
        public async Task<IActionResult> GetCampaignPerformance()
        {
            var result = await _reportService.GetCampaignPerformanceAsync();
            return Ok(result);
        }
    }
}