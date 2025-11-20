using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Data
{
    public class PharmacyDbContext : DbContext
    {
        public PharmacyDbContext(DbContextOptions<PharmacyDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<MedicineCategory> MedicineCategories { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<PrescriptionMedicine> PrescriptionMedicines { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User → Address (1:N)
            modelBuilder.Entity<Address>()
                .HasOne(a => a.User)
                .WithMany(u => u.Addresses)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            // User → Prescriptions (1:N)
            modelBuilder.Entity<Prescription>()
                .HasOne(p => p.User)
                .WithMany(u => u.Prescriptions)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);



            // Medicine → Category (N:1)
            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.MedicineCategory)
                .WithMany(c => c.Medicines)
                .HasForeignKey(m => m.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order → Address (N:1)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Address)
                .WithMany(a => a.Orders)
                .HasForeignKey(o => o.AddressId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order → Prescription (optional)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Prescription)
                .WithMany()
                .HasForeignKey(o => o.PrescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderItem → Order (N:1)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // OrderItem → Medicine (N:1)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Medicine)
                .WithMany()
                .HasForeignKey(oi => oi.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notification → User (N:1)
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany() // fixed: no u.Notifications required
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // PrescriptionMedicine → Prescription (N:1)
            modelBuilder.Entity<PrescriptionMedicine>()
                .HasOne(pm => pm.Prescription)
                .WithMany()
                .HasForeignKey(pm => pm.PrescriptionId)
                .OnDelete(DeleteBehavior.NoAction);

            // PrescriptionMedicine → Medicine (N:1)
            modelBuilder.Entity<PrescriptionMedicine>()
                .HasOne(pm => pm.Medicine)
                .WithMany()
                .HasForeignKey(pm => pm.MedicineId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure enums to store as strings
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<User>()
                .Property(u => u.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Prescription>()
                .Property(p => p.Status)
                .HasConversion<string>();

            // ====== Seed Data ======
            modelBuilder.Entity<MedicineCategory>().HasData(
                new MedicineCategory { CategoryId = 1, CategoryName = "Antibiotics" },
                new MedicineCategory { CategoryId = 2, CategoryName = "Pain Relief" },
                new MedicineCategory { CategoryId = 3, CategoryName = "Vitamins" }
            );
        }
    }
}
