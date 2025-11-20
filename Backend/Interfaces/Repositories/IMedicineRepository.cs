using System.Collections.Generic;
using System.Threading.Tasks;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Interfaces.Repositories
{
    public interface IMedicineRepository
    {
        Task<IEnumerable<Medicine>> GetAllAsync();
        Task<Medicine> GetByIdAsync(int id);
        Task<IEnumerable<Medicine>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Medicine>> SearchByNameAsync(string name);
        Task<Medicine> CreateAsync(Medicine medicine);
        Task UpdateAsync(Medicine medicine);
        Task DeleteAsync(int id);
    }
}
