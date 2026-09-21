using DonationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Campaign> Campaigns => Set<Campaign>();
        public DbSet<Donation> Donations => Set<Donation>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Beneficiary> Beneficiaries => Set<Beneficiary>();
        public DbSet<Receipt> Receipts => Set<Receipt>();
        public DbSet<AssistanceApplication> AssistanceApplications { get; set; }
        public DbSet<AidDelivery> AidDeliveries => Set<AidDelivery>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

        public DbSet<UrgentCampaign> UrgentCampaigns => Set<UrgentCampaign>();
        public DbSet<NotificationPreferences> NotificationPreferences => Set<NotificationPreferences>();
        public DbSet<SecuritySettings> SecuritySettings => Set<SecuritySettings>();
        public DbSet<EmailPreferences> EmailPreferences => Set<EmailPreferences>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
        public DbSet<FaqEntry> FaqEntries { get; set; }

        // ---------- AI ----------
        public DbSet<AiAuditLog> AiAuditLogs => Set<AiAuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Donation>()
                .HasOne(d => d.User)
                .WithMany(u => u.Donations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Donation>()
                .HasOne(d => d.Campaign)
                .WithMany(c => c.Donations)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Donation>()
                .HasOne(d => d.Payment)
                .WithOne(p => p.Donation)
                .HasForeignKey<Donation>(d => d.PaymentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Donation>()
                .HasOne(d => d.Receipt)
                .WithOne(r => r.Donation)
                .HasForeignKey<Receipt>(r => r.DonationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Beneficiary>()
                .HasOne(b => b.Campaign)
                .WithMany(c => c.Beneficiaries)
                .HasForeignKey(b => b.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Beneficiary>()
                .HasOne(b => b.Application)
                .WithMany()
                .HasForeignKey(b => b.ApplicationId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AidDelivery>()
                .HasOne(d => d.Application)
                .WithMany()
                .HasForeignKey(d => d.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AidDelivery>()
                .HasOne(d => d.Volunteer)
                .WithMany()
                .HasForeignKey(d => d.VolunteerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Campaign>().Property(c => c.TargetAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Campaign>().Property(c => c.CollectedAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Donation>().Property(d => d.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<Beneficiary>().Property(b => b.AllocatedAmount).HasPrecision(18, 2);

            modelBuilder.Entity<NotificationPreferences>()
                .HasOne(np => np.User)
                .WithMany()
                .HasForeignKey(np => np.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NotificationPreferences>()
                .HasIndex(np => np.UserId)
                .IsUnique();

            modelBuilder.Entity<SecuritySettings>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SecuritySettings>()
                .HasIndex(s => s.UserId)
                .IsUnique();

            modelBuilder.Entity<EmailPreferences>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmailPreferences>()
                .HasIndex(e => e.UserId)
                .IsUnique();

            // ActivityLog: many rows per user (not unique), oldest-safe on user delete via cascade
            modelBuilder.Entity<ActivityLog>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ActivityLog>()
                .HasIndex(a => a.UserId);

            // AiAuditLog: no foreign key to User on purpose, so audit rows survive user deletion
            modelBuilder.Entity<AiAuditLog>()
                .HasIndex(a => a.CreatedAt);
        }
    }
}