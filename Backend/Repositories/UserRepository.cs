using Microsoft.EntityFrameworkCore;
using ReactPharmacyPortal.Data;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReactPharmacyPortal.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly PharmacyDbContext _context;
        public UserRepository(PharmacyDbContext context) => _context = context;

        public async Task<IEnumerable<User>> GetAllAsync() =>
            await _context.Users.AsNoTracking().ToListAsync();

        public async Task<User> GetByIdAsync(int id) =>
            await _context.Users.Include(u => u.Addresses)
                                .Include(u => u.Prescriptions)
                                .Include(u => u.Orders)
                                .FirstOrDefaultAsync(u => u.UserId == id);


        public async Task<User> GetByEmailAsync(string email) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Create new user and save to database immediately
        public async Task<User> CreateAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Add user to context (doesn't save to database yet)
        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        // Update user and save changes to database
        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null) _context.Users.Remove(user);
        }

        // Save all pending changes to database
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
