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
    public class OrderRepository : IOrderRepository
    {
        private readonly PharmacyDbContext _context;
        public OrderRepository(PharmacyDbContext context) => _context = context;

        public async Task<IEnumerable<Order>> GetAllAsync() =>
            await _context.Orders.Include(o => o.OrderItems)
                                 .ThenInclude(oi => oi.Medicine)
                                 .AsNoTracking().ToListAsync();

        public async Task<Order> GetByIdAsync(int id) =>
            await _context.Orders.Include(o => o.OrderItems)
                                 .ThenInclude(oi => oi.Medicine)
                                 .Include(o => o.Address)
                                 .Include(o => o.Prescription)
                                 .Include(o => o.User)
                                 .FirstOrDefaultAsync(o => o.OrderId == id);

        public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId) =>
            await _context.Orders.Where(o => o.UserId == userId)
                                 .Include(o => o.OrderItems)
                                 .ThenInclude(oi => oi.Medicine)
                                 .AsNoTracking().ToListAsync();

        public async Task<IEnumerable<Order>> GetByStatusAsync(string status)
        {
            if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
                return await _context.Orders.Where(o => o.Status == orderStatus).AsNoTracking().ToListAsync();
            return new List<Order>();
        }

        public async Task<Order> CreateAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null && Enum.TryParse<OrderStatus>(status, out var orderStatus))
            {
                order.Status = orderStatus;
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddAsync(Order order) => await _context.Orders.AddAsync(order);

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var o = await _context.Orders.FindAsync(id);
            if (o != null)
            {
                _context.Orders.Remove(o);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
