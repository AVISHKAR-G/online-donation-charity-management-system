using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers;

[ApiController]
[Route("api/birthday")]
[Authorize(Roles = "Admin")]
public class BirthdayController : ControllerBase
{
    private readonly BirthdayMailSender _mailer;
    private readonly BirthdayRunner _runner;
    private readonly IConfiguration _config;

    public BirthdayController(BirthdayMailSender mailer, BirthdayRunner runner, IConfiguration config)
    {
        _mailer = mailer;
        _runner = runner;
        _config = config;
    }

    /// <summary>
    /// Runs the birthday check RIGHT NOW (ignores the 8 AM rule) and reports what it found.
    /// Users already emailed this year are skipped, so this can't cause duplicates.
    /// POST /api/birthday/run-now
    /// </summary>
    [HttpPost("run-now")]
    public async Task<IActionResult> RunNow(CancellationToken ct)
    {
        var result = await _runner.RunAsync(ignoreSendHour: true, ct);
        return Ok(result);
    }

    /// <summary>
    /// Sends a sample birthday email to any address, to check the email settings and the design.
    /// POST /api/birthday/test?email=you@example.com&amp;name=Avishkar
    /// </summary>
    [HttpPost("test")]
    public async Task<IActionResult> SendTest([FromQuery] string email, [FromQuery] string? name, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Provide ?email=someone@example.com" });

        string donateUrl = (_config["App:FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/') + "/campaigns";
        var (subject, body) = BirthdayEmailTemplate.Build(name ?? "Friend", donateUrl);

        try
        {
            await _mailer.SendAsync(email, subject, body, ct);
            return Ok(new { message = $"Test birthday email sent to {email}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Email failed: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }
}