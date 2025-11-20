using ReactPharmacyPortal.DTOs;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IAddressService
    {
        Task<IEnumerable<AddressDTO>> GetUserAddressesAsync(int userId);
        Task<AddressDTO> GetByIdAsync(int id);
        Task<AddressDTO> CreateAsync(CreateAddressDto addressDto);
        Task UpdateAsync(int id, UpdateAddressDto addressDto);
        Task DeleteAsync(int id);
    }
}