using System.Collections.Generic;
using System.Threading.Tasks;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Interfaces.Repositories
{
    public interface IMedicineCategoryRepository
    {
        Task<IEnumerable<MedicineCategory>> GetAllAsync();
        Task<MedicineCategory> GetByIdAsync(int id);
        Task<MedicineCategory> CreateAsync(MedicineCategory category);
        Task UpdateAsync(MedicineCategory category);
        Task DeleteAsync(int id);
    }
}
