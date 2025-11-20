using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Interfaces.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactPharmacyPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly JwtSettings _jwtSettings;

        public AuthController(IUserService userService, IEmailService emailService, IOptions<JwtSettings> jwtSettings)
        {
            _userService = userService;
            _emailService = emailService;
            _jwtSettings = jwtSettings.Value;
        }

        
        [HttpPost("register-customer")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterCustomer(RegisterCustomerDto dto)
        {
            try
            {
                var user = await _userService.RegisterCustomerAsync(dto);
                await _emailService.SendWelcomeEmailAsync(user.Email, user.Name, "Customer");
                return Ok(new { success = true, message = "Customer registered successfully", user });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

     
        [HttpPost("register-pharmacist")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterPharmacist(RegisterPharmacistDto dto)
        {
            try
            {
                var user = await _userService.RegisterPharmacistAsync(dto);
                await _emailService.SendWelcomeEmailAsync(user.Email, user.Name, "Pharmacist");
                return Ok(new { success = true, message = "Pharmacist registration submitted. Awaiting admin approval.", user });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        // Authenticate user and return JWT token
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { success = false, message = "Please enter both email and password" });
            }

            try
            {
                var user = await _userService.LoginAsync(dto);
                
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    token = token,
                    name = user.Name,
                    role = user.Role,
                    userId = user.UserId
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = "Invalid email or password" });
            }
        }

        // Create JWT token with user claims for authentication
        private string GenerateJwtToken(UserDTO user)
        {
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

   
        [HttpPut("approve-pharmacist/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApprovePharmacist(int id)
        {
            try
            {
                var statusDto = new UpdateUserStatusDto { Status = ReactPharmacyPortal.Enums.UserStatus.Active };
                await _userService.UpdateStatusAsync(id, statusDto);
                var user = await _userService.GetByIdAsync(id);
                await _emailService.SendApprovalEmailAsync(user.Email, user.Name);
                return Ok(new { message = "Pharmacist approved successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(dto.Email);
                if (user == null)
                {
                    return Ok(new { message = "If the email exists, a password reset link has been sent." });
                }

                await _userService.ForgotPasswordAsync(dto.Email);
                var updatedUser = await _userService.GetByEmailAsync(dto.Email);
                await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name, updatedUser.ResetToken);
                
                return Ok(new { message = "If the email exists, a password reset link has been sent." });
            }
            catch (Exception ex)
            {
                return Ok(new { message = "If the email exists, a password reset link has been sent." });
            }
        }

   
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                await _userService.ResetPasswordAsync(dto.Token, dto.NewPassword);
                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}