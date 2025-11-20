using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Enums;
using ReactPharmacyPortal.Services.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ReactPharmacyPortal.Services
{
    public class DataSeedService
    {
        private readonly PharmacyDbContext _context;

        public DataSeedService(PharmacyDbContext context)
        {
            _context = context;
        }

        public async Task SeedDataAsync()
        {
            // Check if admin exists
            if (!await _context.Users.AnyAsync(u => u.Email == "admin@pharmacy.com"))
            {
                var adminSalt = HashHelper.GenerateSalt();
                var admin = new User
                {
                    Name = "System Admin",
                    Email = "admin@pharmacy.com",
                    Salt = adminSalt,
                    PasswordHash = HashHelper.HashPassword("Admin@123", adminSalt),
                    Role = UserRole.Admin,
                    Status = UserStatus.Active,
                    Phone = "1234567890",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(admin);
            }

            // Check if pharmacist exists
            if (!await _context.Users.AnyAsync(u => u.Email == "pharmacist@pharmacy.com"))
            {
                var pharmacistSalt = HashHelper.GenerateSalt();
                var pharmacist = new User
                {
                    Name = "System Pharmacist",
                    Email = "pharmacist@pharmacy.com",
                    Salt = pharmacistSalt,
                    PasswordHash = HashHelper.HashPassword("Pharmacist@123", pharmacistSalt),
                    Role = UserRole.Pharmacist,
                    Status = UserStatus.Active,
                    Phone = "9987654321",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(pharmacist);
            }

            await _context.SaveChangesAsync();

            // Seed Medicine Categories
            if (!await _context.MedicineCategories.AnyAsync())
            {
                var categories = new List<MedicineCategory>
                {
                    new MedicineCategory { CategoryName = "Antibiotics" },
                    new MedicineCategory { CategoryName = "Pain Relief" },
                    new MedicineCategory { CategoryName = "Vitamins & Supplements" },
                    new MedicineCategory { CategoryName = "Diabetes Care" },
                    new MedicineCategory { CategoryName = "Heart & Blood Pressure" },
                    new MedicineCategory { CategoryName = "Respiratory" }
                };
                _context.MedicineCategories.AddRange(categories);
                await _context.SaveChangesAsync();
            }

            // Seed Medicines
            if (!await _context.Medicines.AnyAsync())
            {
                var pharmacist = await _context.Users.FirstAsync(u => u.Role == UserRole.Pharmacist);
                var categories = await _context.MedicineCategories.ToListAsync();

                var medicines = new List<Medicine>
                {
                    // Antibiotics
                    new Medicine { Name = "Amoxicillin 500mg", Description = "Broad-spectrum antibiotic", CategoryId = categories[0].CategoryId, Price = 120.00m, Stock = 100, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Azithromycin 250mg", Description = "Macrolide antibiotic", CategoryId = categories[0].CategoryId, Price = 180.00m, Stock = 75, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    
                    // Pain Relief
                    new Medicine { Name = "Paracetamol 650mg", Description = "Pain and fever relief", CategoryId = categories[1].CategoryId, Price = 25.00m, Stock = 200, RequiresPrescription = false, ExpiryDate = DateTime.UtcNow.AddYears(3), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Ibuprofen 400mg", Description = "Anti-inflammatory pain relief", CategoryId = categories[1].CategoryId, Price = 45.00m, Stock = 150, RequiresPrescription = false, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    
                    // Vitamins
                    new Medicine { Name = "Vitamin D3 1000IU", Description = "Bone health supplement", CategoryId = categories[2].CategoryId, Price = 350.00m, Stock = 80, RequiresPrescription = false, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Multivitamin Tablets", Description = "Complete vitamin supplement", CategoryId = categories[2].CategoryId, Price = 280.00m, Stock = 120, RequiresPrescription = false, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    
                    // Diabetes Care
                    new Medicine { Name = "Metformin 500mg", Description = "Type 2 diabetes medication", CategoryId = categories[3].CategoryId, Price = 85.00m, Stock = 90, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Insulin Glargine", Description = "Long-acting insulin", CategoryId = categories[3].CategoryId, Price = 1200.00m, Stock = 25, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(1), CreatedBy = pharmacist.UserId },
                    
                    // Heart & Blood Pressure
                    new Medicine { Name = "Amlodipine 5mg", Description = "Blood pressure medication", CategoryId = categories[4].CategoryId, Price = 95.00m, Stock = 110, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Atorvastatin 20mg", Description = "Cholesterol medication", CategoryId = categories[4].CategoryId, Price = 150.00m, Stock = 85, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    
                    // Respiratory
                    new Medicine { Name = "Salbutamol Inhaler", Description = "Asthma relief inhaler", CategoryId = categories[5].CategoryId, Price = 220.00m, Stock = 60, RequiresPrescription = true, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId },
                    new Medicine { Name = "Cough Syrup", Description = "Dry cough relief", CategoryId = categories[5].CategoryId, Price = 75.00m, Stock = 140, RequiresPrescription = false, ExpiryDate = DateTime.UtcNow.AddYears(2), CreatedBy = pharmacist.UserId }
                };
                _context.Medicines.AddRange(medicines);
                await _context.SaveChangesAsync();
            }

            // Seed Customer and Addresses
            if (!await _context.Users.AnyAsync(u => u.Email == "customer@pharmacy.com"))
            {
                var customerSalt = HashHelper.GenerateSalt();
                var customer = new User
                {
                    Name = "John Customer",
                    Email = "customer@pharmacy.com",
                    Salt = customerSalt,
                    PasswordHash = HashHelper.HashPassword("Customer@123", customerSalt),
                    Role = UserRole.Customer,
                    Status = UserStatus.Active,
                    Phone = "9876543210",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(customer);
                await _context.SaveChangesAsync();

                // Add addresses for customer
                var addresses = new List<Address>
                {
                    new Address { UserId = customer.UserId, FullName = "John Customer", PhoneNumber = "9876543210", AddressLine1 = "123 Main Street", City = "Mumbai", State = "Maharashtra", PostalCode = "400001", IsDefault = true },
                    new Address { UserId = customer.UserId, FullName = "John Customer", PhoneNumber = "9876543210", AddressLine1 = "456 Work Plaza", AddressLine2 = "Office Complex", City = "Mumbai", State = "Maharashtra", PostalCode = "400002", IsDefault = false }
                };
                _context.Addresses.AddRange(addresses);
                await _context.SaveChangesAsync();
            }

            // Seed Sample Orders
            var existingCustomer = await _context.Users.FirstOrDefaultAsync(u => u.Email == "customer@pharmacy.com");
            if (existingCustomer != null && !await _context.Orders.AnyAsync())
            {
                var customerAddress = await _context.Addresses.FirstAsync(a => a.UserId == existingCustomer.UserId && a.IsDefault);
                var medicines = await _context.Medicines.Take(4).ToListAsync();

                var orders = new List<Order>
                {
                    new Order { UserId = existingCustomer.UserId, AddressId = customerAddress.AddressId, TotalAmount = 345.00m, Status = OrderStatus.Delivered, CreatedAt = DateTime.UtcNow.AddDays(-7) },
                    new Order { UserId = existingCustomer.UserId, AddressId = customerAddress.AddressId, TotalAmount = 520.00m, Status = OrderStatus.Processing, CreatedAt = DateTime.UtcNow.AddDays(-2) }
                };
                _context.Orders.AddRange(orders);
                await _context.SaveChangesAsync();

                // Add order items
                var orderItems = new List<OrderItem>
                {
                    // First order items
                    new OrderItem { OrderId = orders[0].OrderId, MedicineId = medicines[0].MedicineId, Quantity = 2, Price = medicines[0].Price },
                    new OrderItem { OrderId = orders[0].OrderId, MedicineId = medicines[1].MedicineId, Quantity = 1, Price = medicines[1].Price },
                    
                    // Second order items
                    new OrderItem { OrderId = orders[1].OrderId, MedicineId = medicines[2].MedicineId, Quantity = 3, Price = medicines[2].Price },
                    new OrderItem { OrderId = orders[1].OrderId, MedicineId = medicines[3].MedicineId, Quantity = 1, Price = medicines[3].Price }
                };
                _context.OrderItems.AddRange(orderItems);
                await _context.SaveChangesAsync();
            }

            // Seed Sample Prescriptions
            if (existingCustomer != null && !await _context.Prescriptions.AnyAsync())
            {
                var pharmacist = await _context.Users.FirstAsync(u => u.Role == UserRole.Pharmacist);

                var prescriptions = new List<Prescription>
                {
                    new Prescription { UserId = existingCustomer.UserId, FileUrl = "/uploads/prescriptions/sample_prescription_1.pdf", Status = PrescriptionStatus.Verified, UploadedAt = DateTime.UtcNow.AddDays(-5) },
                    new Prescription { UserId = existingCustomer.UserId, FileUrl = "/uploads/prescriptions/sample_prescription_2.pdf", Status = PrescriptionStatus.Pending, UploadedAt = DateTime.UtcNow.AddDays(-1) }
                };
                _context.Prescriptions.AddRange(prescriptions);
                await _context.SaveChangesAsync();
            }


        }
    }
}