using System.Collections.Generic;
using System.Threading.Tasks;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Interfaces.Repositories
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Order>> GetByStatusAsync(string status);
        Task<Order> CreateAsync(Order order);
        Task UpdateAsync(Order order);
        Task UpdateStatusAsync(int id, string status);
        Task DeleteAsync(int id);
    }
}
