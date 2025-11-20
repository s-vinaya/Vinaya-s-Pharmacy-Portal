using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pending-pharmacists")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetPendingPharmacists()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                var pendingPharmacists = users.Where(u => u.Role == "Pharmacist" &&
                    (u.Status == "PendingApproval" || u.Status == "Pending")).ToList();
                return Ok(pendingPharmacists);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null) return NotFound(new { message = "User not found" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDTO>> GetUserByEmail(string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                if (user == null) return NotFound(new { message = "User not found" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDTO>> RegisterUser(RegisterUserDto userDto)
        {
            try
            {
                var createdUser = await _userService.CreateAsync(userDto);
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, createdUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, UserDTO userDto)
        {
            try
            {
                await _userService.UpdateAsync(id, userDto);
                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserStatus(int id, UpdateUserStatusDto statusDto)
        {
            try
            {
                await _userService.UpdateStatusAsync(id, statusDto);
                return Ok(new { message = "User status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _userService.DeleteAsync(id);
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("count")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<int>> GetUsersCount()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(users.Count());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pending-pharmacists/count")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<int>> GetPendingPharmacistsCount()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                var count = users.Count(u => u.Role == "Pharmacist" &&
                    (u.Status == "PendingApproval" || u.Status == "Pending"));
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("profile/{id}")]
        [Authorize(Roles = "Customer,Pharmacist")]
        public async Task<ActionResult<UserDTO>> GetProfile(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { message = "Invalid user ID" });

                var user = await _userService.GetByIdAsync(id);
                if (user == null) return NotFound(new { message = "User not found" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("profile/{id}")]
        [Authorize(Roles = "Customer,Pharmacist")]
        public async Task<IActionResult> UpdateProfile(int id, UserDTO userDto)
        {
            try
            {
                await _userService.UpdateAsync(id, userDto);
                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
