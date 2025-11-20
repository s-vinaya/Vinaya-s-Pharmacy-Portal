using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReactPharmacyPortal.Repositories
{
    public class MedicineRepository : IMedicineRepository
    {
        private readonly PharmacyDbContext _context;
        public MedicineRepository(PharmacyDbContext context) => _context = context;

        public async Task<IEnumerable<Medicine>> GetAllAsync() =>
            await _context.Medicines.Include(m => m.MedicineCategory).AsNoTracking().ToListAsync();

        public async Task<Medicine> GetByIdAsync(int id) =>
            await _context.Medicines.Include(m => m.MedicineCategory)
                                    .FirstOrDefaultAsync(m => m.MedicineId == id);

        public async Task<IEnumerable<Medicine>> GetByCategoryAsync(int categoryId) =>
            await _context.Medicines.Where(m => m.CategoryId == categoryId).AsNoTracking().ToListAsync();

        public async Task<IEnumerable<Medicine>> SearchByNameAsync(string name) =>
            await _context.Medicines.Where(m => m.Name.Contains(name)).AsNoTracking().ToListAsync();

        public async Task<Medicine> CreateAsync(Medicine medicine)
        {
            await _context.Medicines.AddAsync(medicine);
            await _context.SaveChangesAsync();
            return medicine;
        }

        public async Task AddAsync(Medicine medicine) => await _context.Medicines.AddAsync(medicine);

        public async Task UpdateAsync(Medicine medicine)
        {
            _context.Medicines.Update(medicine);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine != null)
            {
                try
                {
                    _context.Medicines.Remove(medicine);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // Check if it's a foreign key constraint violation
                    if (ex.InnerException?.Message.Contains("REFERENCE constraint") == true ||
                        ex.InnerException?.Message.Contains("foreign key constraint") == true)
                    {
                        throw new InvalidOperationException("Cannot delete medicine as it is referenced in existing orders or prescriptions. Please remove all references first.");
                    }
                    throw; // Re-throw if it's a different error
                }
            }
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
