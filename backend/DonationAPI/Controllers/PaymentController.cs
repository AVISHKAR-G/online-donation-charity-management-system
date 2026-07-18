using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder(CreateOrderRequestDto request)
        {
            var result = await _paymentService.CreateOrderAsync(request);
            return Ok(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify(VerifyPaymentDto dto)
        {
            var result = await _paymentService.VerifyPaymentAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _paymentService.GetAllAsync();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _paymentService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}