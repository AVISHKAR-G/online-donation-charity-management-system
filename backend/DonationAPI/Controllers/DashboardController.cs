using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IReportService _reportService;

        public DashboardController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _reportService.GetDashboardSummaryAsync();
            return Ok(summary);
        }
    }
}
