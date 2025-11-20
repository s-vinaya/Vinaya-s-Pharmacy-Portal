using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Interfaces.Repositories
{
    public interface IAddressRepository
    {
        Task<IEnumerable<Address>> GetAllAsync();
        Task<Address> GetByIdAsync(int id);
        Task<IEnumerable<Address>> GetByUserIdAsync(int userId);
        Task<Address> CreateAsync(Address address);
        Task<Address> UpdateAsync(Address address);
        Task DeleteAsync(int id);
    }
}