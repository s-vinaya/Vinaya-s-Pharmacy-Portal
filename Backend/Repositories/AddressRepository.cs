using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly PharmacyDbContext _context;

        public AddressRepository(PharmacyDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Address>> GetAllAsync()
        {
            return await _context.Addresses
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<Address> GetByIdAsync(int id)
        {
            return await _context.Addresses
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AddressId == id);
        }

        public async Task<IEnumerable<Address>> GetByUserIdAsync(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<Address> CreateAsync(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
            return address;
        }

        public async Task<Address> UpdateAsync(Address address)
        {
            _context.Entry(address).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return address;
        }

        public async Task DeleteAsync(int id)
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address != null)
            {
                _context.Addresses.Remove(address);
                await _context.SaveChangesAsync();
            }
        }
    }
}