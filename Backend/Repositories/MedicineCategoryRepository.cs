using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReactPharmacyPortal.Repositories
{
    public class MedicineCategoryRepository : IMedicineCategoryRepository
    {
        private readonly PharmacyDbContext _context;
        public MedicineCategoryRepository(PharmacyDbContext context) => _context = context;

        public async Task<IEnumerable<MedicineCategory>> GetAllAsync() =>
            await _context.MedicineCategories.AsNoTracking().ToListAsync();

        public async Task<MedicineCategory> GetByIdAsync(int id) =>
            await _context.MedicineCategories.Include(c => c.Medicines)
                                             .FirstOrDefaultAsync(c => c.CategoryId == id);

        public async Task<MedicineCategory> CreateAsync(MedicineCategory category)
        {
            await _context.MedicineCategories.AddAsync(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task AddAsync(MedicineCategory category) => await _context.MedicineCategories.AddAsync(category);

        public async Task UpdateAsync(MedicineCategory category)
        {
            _context.MedicineCategories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var c = await _context.MedicineCategories.FindAsync(id);
            if (c != null)
            {
                _context.MedicineCategories.Remove(c);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
