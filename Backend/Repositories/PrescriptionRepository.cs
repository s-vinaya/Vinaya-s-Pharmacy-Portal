using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReactPharmacyPortal.Repositories
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly PharmacyDbContext _context;
        public PrescriptionRepository(PharmacyDbContext context) => _context = context;

        public async Task<IEnumerable<Prescription>> GetAllAsync() =>
            await _context.Prescriptions.Include(p => p.User)
                                        .Include(p => p.PrescriptionMedicines)
                                        .AsNoTracking().ToListAsync();

        public async Task<Prescription> GetByIdAsync(int id) =>
            await _context.Prescriptions.Include(p => p.User)
                                        .Include(p => p.PrescriptionMedicines)
                                        .FirstOrDefaultAsync(p => p.PrescriptionId == id);

        public async Task<IEnumerable<Prescription>> GetByUserIdAsync(int userId) =>
            await _context.Prescriptions.Where(p => p.UserId == userId).AsNoTracking().ToListAsync();

        public async Task<IEnumerable<Prescription>> GetByStatusAsync(string status)
        {
            if (Enum.TryParse<PrescriptionStatus>(status, out var prescriptionStatus))
                return await _context.Prescriptions.Where(p => p.Status == prescriptionStatus).AsNoTracking().ToListAsync();
            return new List<Prescription>();
        }

        public async Task<Prescription> CreateAsync(Prescription prescription)
        {
            await _context.Prescriptions.AddAsync(prescription);
            await _context.SaveChangesAsync();
            return prescription;
        }

        public async Task VerifyPrescriptionAsync(int id, int pharmacistId)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription != null)
            {
                prescription.Status = PrescriptionStatus.Verified;
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateAsync(Prescription prescription)
        {
            _context.Prescriptions.Update(prescription);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var p = await _context.Prescriptions.FindAsync(id);
            if (p != null)
            {
                _context.Prescriptions.Remove(p);
                await _context.SaveChangesAsync();
            }
        }
    }
}
