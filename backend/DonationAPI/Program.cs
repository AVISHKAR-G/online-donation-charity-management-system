using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using DonationAPI.Data;
using DonationAPI.Helpers;
using DonationAPI.Middleware;
using DonationAPI.Models;
using DonationAPI.Repositories;
using DonationAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- Services ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Donation & Charity Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your token}"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// MySQL via Pomelo
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// JWT Auth
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
    };
});
builder.Services.AddAuthorization();

// CORS - allow the React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Rate limiting (used by AI endpoints via [EnableRateLimiting("ai")])
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("ai", ctx =>
    {
        var key = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? ctx.Connection.RemoteIpAddress?.ToString()
                  ?? "anon";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});

// In-memory cache (used by DonorController to hold the emailed password-change codes)
builder.Services.AddMemoryCache();

// DI: Helpers, Repositories, Services
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IDocumentValidationService, DocumentValidationService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IDonationService, DonationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IBeneficiaryService, BeneficiaryService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAidDeliveryService, AidDeliveryService>();
builder.Services.AddScoped<IFraudDetectionService, FraudDetectionService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddHttpClient();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUrgentCampaignService, UrgentCampaignService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();

// ---------- AI services ----------
builder.Services.AddScoped<IAiAuditService, AiAuditService>();
builder.Services.AddScoped<IChatbotService, ChatbotService>();

// Single LLM client registration — LlmClient currently targets Groq's
// OpenAI-compatible chat-completions endpoint (see Services/LlmClient.cs).
// AnthropicLlmClient and GroqLlmClient stubs were removed from here to
// avoid multiple competing ILlmClient registrations (DI keeps only the
// last one registered when several map to the same interface).
builder.Services.AddHttpClient<ILlmClient, LlmClient>();

// Background job: sends a "donate reminder" (in-app + email) to every active user every 10 days
builder.Services.AddHostedService<DonationReminderBackgroundService>();

// Background job: sends a "Happy Birthday" email to each active user on their birthday (8:00 AM IST)
builder.Services.AddScoped<BirthdayMailSender>();
builder.Services.AddScoped<BirthdayRunner>();
builder.Services.AddHostedService<BirthdayEmailService>();

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

var app = builder.Build();

// ---------- Seed a default admin account if none exists ----------
// Credentials can be overridden via configuration (user-secrets / environment variables):
//   SeedAdmin:Email, SeedAdmin:Password
// The fallback values below keep existing behaviour; remove them once your config is set.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!context.Users.Any(u => u.Role == UserRole.Admin))
    {
        var seedEmail = builder.Configuration["SeedAdmin:Email"] ?? "avishkarg2007@gmail.com";
        var seedPassword = builder.Configuration["SeedAdmin:Password"] ?? "Admin@123";

        var admin = new User
        {
            Name = "Admin",
            Email = seedEmail,
            Phone = "9999999999",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
            Role = UserRole.Admin,
            IsActive = true
        };

        context.Users.Add(admin);
        context.SaveChanges();
    }
}

// ---------- Middleware pipeline ----------
app.UseMiddleware<ExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapGet("/", () => Results.Redirect("/swagger"));
}
app.UseCors("AllowReactApp");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
app.Run();