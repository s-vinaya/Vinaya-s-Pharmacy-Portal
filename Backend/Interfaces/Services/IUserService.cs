using ReactPharmacyPortal.DTOs;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDTO>> GetAllAsync();
        Task<UserDTO> GetByIdAsync(int id);
        Task<UserDTO> GetByEmailAsync(string email);
        Task<UserDTO> CreateAsync(RegisterUserDto userDto);
        Task<UserDTO> RegisterPharmacistAsync(RegisterPharmacistDto pharmacistDto);
        Task<UserDTO> RegisterCustomerAsync(RegisterCustomerDto customerDto);
        Task<UserDTO> LoginAsync(LoginDto loginDto);
        Task UpdateAsync(int id, UserDTO userDto);
        Task UpdateStatusAsync(int id, UpdateUserStatusDto statusDto);
        Task DeleteAsync(int id);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}
