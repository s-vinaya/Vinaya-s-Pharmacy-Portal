using AutoMapper;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Services
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _repo;
        private readonly IMapper _mapper;

        public AddressService(IAddressRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AddressDTO>> GetUserAddressesAsync(int userId)
        {
            var addresses = await _repo.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<AddressDTO>>(addresses);
        }

        public async Task<AddressDTO> GetByIdAsync(int id)
        {
            var address = await _repo.GetByIdAsync(id);
            return address == null ? null : _mapper.Map<AddressDTO>(address);
        }

        public async Task<AddressDTO> CreateAsync(CreateAddressDto addressDto)
        {
            var address = _mapper.Map<Address>(addressDto);
            address.CreatedAt = DateTime.UtcNow;
            
            var createdAddress = await _repo.CreateAsync(address);
            return _mapper.Map<AddressDTO>(createdAddress);
        }

        public async Task UpdateAsync(int id, UpdateAddressDto addressDto)
        {
            var existingAddress = await _repo.GetByIdAsync(id);
            if (existingAddress == null)
                throw new ArgumentException("Address not found");

            _mapper.Map(addressDto, existingAddress);
            await _repo.UpdateAsync(existingAddress);
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }
    }
}