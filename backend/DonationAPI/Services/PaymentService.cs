using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;
using DonationAPI.Data;
using DonationAPI.DTOs;
using Payment = DonationAPI.Models.Payment;
using PaymentMethod = DonationAPI.Models.PaymentMethod;
using PaymentStatus = DonationAPI.Models.PaymentStatus;

namespace DonationAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public PaymentService(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            var keyId = _config["Razorpay:KeyId"];
            var keySecret = _config["Razorpay:KeySecret"];

            if (string.IsNullOrEmpty(keyId) || string.IsNullOrEmpty(keySecret))
                throw new InvalidOperationException("Razorpay keys are not configured in appsettings.json");

            var client = new RazorpayClient(keyId, keySecret);

            var options = new Dictionary<string, object>
            {
                { "amount", (int)(request.Amount * 100) }, // paise
                { "currency", "INR" },
                { "receipt", $"receipt_{Guid.NewGuid():N}" },
                { "payment_capture", 1 }
            };

            Order order = client.Order.Create(options);
            string orderId = order.Attributes["id"].ToString();

            var payment = new Payment
            {
                Method = request.Method,
                Amount = request.Amount,
                Status = PaymentStatus.Pending,
                RazorpayOrderId = orderId
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new CreateOrderResponseDto
            {
                PaymentId = payment.PaymentId,
                OrderId = orderId,
                KeyId = keyId,
                Amount = request.Amount
            };
        }

        public async Task<VerifyPaymentResponseDto> VerifyPaymentAsync(VerifyPaymentDto dto)
        {
            var keySecret = _config["Razorpay:KeySecret"];

            var attributes = new Dictionary<string, string>
            {
                { "razorpay_order_id", dto.RazorpayOrderId },
                { "razorpay_payment_id", dto.RazorpayPaymentId },
                { "razorpay_signature", dto.RazorpaySignature },
                { "key_secret", keySecret! }
            };

            bool isValid = true;
            try
            {
                Utils.verifyPaymentSignature(attributes);
            }
            catch
            {
                isValid = false;
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.RazorpayOrderId == dto.RazorpayOrderId);

            if (payment == null)
            {
                return new VerifyPaymentResponseDto
                {
                    Success = false,
                    Message = "Payment record not found for this order."
                };
            }

            payment.Status = isValid ? PaymentStatus.Success : PaymentStatus.Failed;
            payment.RazorpayPaymentId = dto.RazorpayPaymentId;
            payment.RazorpaySignature = dto.RazorpaySignature;
            await _context.SaveChangesAsync();

            return new VerifyPaymentResponseDto
            {
                Success = isValid,
                Message = isValid ? "Payment verified successfully" : "Payment verification failed",
                PaymentId = payment.PaymentId
            };
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetAllAsync()
        {
            var payments = await _context.Payments
                .Include(p => p.Donation)
                    .ThenInclude(d => d!.User)
                .Where(p => p.Status == PaymentStatus.Success)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                TransactionId = p.TransactionId,
                Donor = p.Donation == null
                    ? "—"
                    : (p.Donation.IsAnonymous ? "Anonymous" : (p.Donation.User?.Name ?? "Unknown")),
                Amount = p.Amount,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                PaymentDate = p.PaymentDate
            });
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return false;

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}