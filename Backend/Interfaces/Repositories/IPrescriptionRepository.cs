using System.Collections.Generic;
using System.Threading.Tasks;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Interfaces.Repositories
{
    public interface IPrescriptionRepository
    {
        Task<IEnumerable<Prescription>> GetAllAsync();
        Task<Prescription> GetByIdAsync(int id);
        Task<IEnumerable<Prescription>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Prescription>> GetByStatusAsync(string status);
        Task<Prescription> CreateAsync(Prescription prescription);
        Task UpdateAsync(Prescription prescription);
        Task VerifyPrescriptionAsync(int id, int pharmacistId);
        Task DeleteAsync(int id);
    }
}
