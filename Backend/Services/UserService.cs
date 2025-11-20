using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Services.Helpers;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public UserService(IUserRepository repo, IMapper mapper, IEmailService emailService)
        {
            _repo = repo;
            _mapper = mapper;
            _emailService = emailService;
        }

        // Retrieve all active users from database ordered by name
        public async Task<IEnumerable<UserDTO>> GetAllAsync()
        {
            var users = await _repo.GetAllAsync();
            var activeUsers = users.Where(u => u.Status != UserStatus.Inactive).OrderBy(u => u.Name);
            return _mapper.Map<IEnumerable<UserDTO>>(activeUsers);
        }

        // Find a specific user by their unique ID
        public async Task<UserDTO> GetByIdAsync(int id)
        {
            if (id <= 0)
                return null;

            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                return null;

            return _mapper.Map<UserDTO>(user);
        }

        // Find a user by their email address
        public async Task<UserDTO> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required");

            var user = await _repo.GetByEmailAsync(email);
            if (user == null)
                return null;

            return _mapper.Map<UserDTO>(user);
        }

        // Create a new user account with validation and password hashing
        public async Task<UserDTO> RegisterAsync(RegisterUserDto userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Email))
                throw new ArgumentException("Email is required");

            if (string.IsNullOrWhiteSpace(userDto.Password) || userDto.Password.Length < 6)
                throw new ArgumentException("Password must be at least 6 characters long");

            if (string.IsNullOrWhiteSpace(userDto.Name) || userDto.Name.Length < 2)
                throw new ArgumentException("Name must be at least 2 characters long");

            var existingUser = await _repo.GetByEmailAsync(userDto.Email);
            if (existingUser != null)
                throw new InvalidOperationException($"User with email '{userDto.Email}' already exists");

            var user = _mapper.Map<User>(userDto);
            user.Salt = HashHelper.GenerateSalt();
            user.PasswordHash = HashHelper.HashPassword(userDto.Password, user.Salt);
            user.Status = userDto.Role == UserRole.Pharmacist ? UserStatus.PendingApproval : UserStatus.Active;
            user.CreatedAt = DateTime.UtcNow;
            
            var createdUser = await _repo.CreateAsync(user);
            return _mapper.Map<UserDTO>(createdUser);
        }

        // Authenticate user login with email and password verification
        public async Task<UserDTO> LoginAsync(LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email))
                throw new ArgumentException("Email is required");

            if (string.IsNullOrWhiteSpace(loginDto.Password))
                throw new ArgumentException("Password is required");

            var user = await _repo.GetByEmailAsync(loginDto.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            if (user.Status == UserStatus.PendingApproval)
                throw new UnauthorizedAccessException("Your account is pending admin approval. Please wait for approval.");
            
            if (user.Status == UserStatus.Rejected)
                throw new UnauthorizedAccessException($"Your application has been rejected. Reason: {user.RejectionReason ?? "Please contact admin for details."}");
            
            if (user.Status == UserStatus.Blocked)
                throw new UnauthorizedAccessException("Your account has been blocked. Please contact admin.");
            
            if (user.Status != UserStatus.Active)
                throw new UnauthorizedAccessException("Account is not active");

            if (!HashHelper.VerifyPassword(loginDto.Password, user.PasswordHash, user.Salt))
                throw new UnauthorizedAccessException("Invalid email or password");

            return _mapper.Map<UserDTO>(user);
        }

        // Update user status (Active, Pending, etc.) and send email notifications
        public async Task UpdateStatusAsync(int id, UpdateUserStatusDto statusDto)
        {
            var existingUser = await _repo.GetByIdAsync(id);
            if (existingUser == null)
                throw new ArgumentException("User not found");

            var oldStatus = existingUser.Status;
            existingUser.Status = statusDto.Status;
            existingUser.RejectionReason = statusDto.RejectionReason;
            
            await _repo.UpdateAsync(existingUser);

            // Send email notifications for pharmacist status changes
            if (existingUser.Role == UserRole.Pharmacist && oldStatus != statusDto.Status)
            {
                try
                {
                    if (statusDto.Status == UserStatus.Active)
                    {
                        await _emailService.SendApprovalEmailAsync(existingUser.Email, existingUser.Name);
                    }
                    else if (statusDto.Status == UserStatus.Rejected && !string.IsNullOrEmpty(statusDto.RejectionReason))
                    {
                        await _emailService.SendRejectionEmailAsync(existingUser.Email, existingUser.Name, statusDto.RejectionReason);
                    }
                }
                catch (Exception ex)
                {
    
                }
            }
        }

        // Soft delete user by changing status to Inactive
        public async Task DeleteAsync(int id)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new ArgumentException("User not found");

            user.Status = UserStatus.Inactive;
            await _repo.UpdateAsync(user);
        }

        // Create user account (wrapper for RegisterAsync)
        public async Task<UserDTO> CreateAsync(RegisterUserDto userDto)
        {
            return await RegisterAsync(userDto);
        }

        // Register pharmacist with specific DTO
        public async Task<UserDTO> RegisterPharmacistAsync(RegisterPharmacistDto pharmacistDto)
        {
            if (string.IsNullOrWhiteSpace(pharmacistDto.Email))
                throw new ArgumentException("Email is required");

            var existingUser = await _repo.GetByEmailAsync(pharmacistDto.Email);
            if (existingUser != null)
                throw new InvalidOperationException($"User with email '{pharmacistDto.Email}' already exists");

            var user = _mapper.Map<User>(pharmacistDto);
            user.Salt = HashHelper.GenerateSalt();
            user.PasswordHash = HashHelper.HashPassword(pharmacistDto.Password, user.Salt);
            user.Status = UserStatus.PendingApproval;
            user.Role = UserRole.Pharmacist;
            user.CreatedAt = DateTime.UtcNow;
            
            var createdUser = await _repo.CreateAsync(user);
            return _mapper.Map<UserDTO>(createdUser);
        }

        // Register customer with specific DTO
        public async Task<UserDTO> RegisterCustomerAsync(RegisterCustomerDto customerDto)
        {
            if (string.IsNullOrWhiteSpace(customerDto.Email))
                throw new ArgumentException("Email is required");

            var existingUser = await _repo.GetByEmailAsync(customerDto.Email);
            if (existingUser != null)
                throw new InvalidOperationException($"User with email '{customerDto.Email}' already exists");

            var user = _mapper.Map<User>(customerDto);
            user.Salt = HashHelper.GenerateSalt();
            user.PasswordHash = HashHelper.HashPassword(customerDto.Password, user.Salt);
            user.Status = UserStatus.Active;
            user.Role = UserRole.Customer;
            user.CreatedAt = DateTime.UtcNow;
            
            var createdUser = await _repo.CreateAsync(user);
            return _mapper.Map<UserDTO>(createdUser);
        }

        // Update user profile information (name, email, phone, role)
        public async Task UpdateAsync(int id, UserDTO userDto)
        {
            var existingUser = await _repo.GetByIdAsync(id);
            if (existingUser == null)
                throw new ArgumentException("User not found");

            if (!string.IsNullOrWhiteSpace(userDto.Name))
                existingUser.Name = userDto.Name;
            if (!string.IsNullOrWhiteSpace(userDto.Email))
                existingUser.Email = userDto.Email;
            if (!string.IsNullOrWhiteSpace(userDto.Phone))
                existingUser.Phone = userDto.Phone;
            if (!string.IsNullOrWhiteSpace(userDto.Role))
                existingUser.Role = Enum.Parse<UserRole>(userDto.Role);

            await _repo.UpdateAsync(existingUser);
        }

        // Generate password reset token for user (1 hour expiry)
        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _repo.GetByEmailAsync(email);
            if (user == null)
                throw new ArgumentException("User not found");

            user.ResetToken = Guid.NewGuid().ToString();
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _repo.UpdateAsync(user);
        }

        // Reset user password using valid reset token
        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var users = await _repo.GetAllAsync();
            var user = users.FirstOrDefault(u => u.ResetToken == token && u.ResetTokenExpiry > DateTime.UtcNow);
            
            if (user == null)
                throw new ArgumentException("Invalid or expired reset token");

            user.Salt = HashHelper.GenerateSalt();
            user.PasswordHash = HashHelper.HashPassword(newPassword, user.Salt);
            user.ResetToken = string.Empty;
            user.ResetTokenExpiry = DateTime.MinValue;
            await _repo.UpdateAsync(user);
        }
    }
}