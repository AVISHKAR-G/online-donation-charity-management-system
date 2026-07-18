using DonationAPI.DTOs;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Volunteer")]
    public class AidDeliveryController : ControllerBase
    {
        private readonly IAidDeliveryService _service;

        public AidDeliveryController(IAidDeliveryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateAidDeliveryDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateAidDeliveryStatusDto dto)
        {
            var result = await _service.UpdateStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }
    }
}