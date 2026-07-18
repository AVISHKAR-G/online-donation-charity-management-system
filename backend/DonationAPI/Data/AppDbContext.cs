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
        }
    }
}