using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddressesController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressesController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AddressDTO>>> GetUserAddresses(int userId)
        {
            try
            {
                var addresses = await _addressService.GetUserAddressesAsync(userId);
                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AddressDTO>> GetAddress(int id)
        {
            try
            {
                var address = await _addressService.GetByIdAsync(id);
                if (address == null) return NotFound();
                return Ok(address);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AddressDTO>> CreateAddress(CreateAddressDto addressDto)
        {
            try
            {
                var address = await _addressService.CreateAsync(addressDto);
                return CreatedAtAction(nameof(GetAddress), new { id = address.AddressId }, address);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, UpdateAddressDto addressDto)
        {
            try
            {
                await _addressService.UpdateAsync(id, addressDto);
                return Ok(new { message = "Address updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            try
            {
                await _addressService.DeleteAsync(id);
                return Ok(new { message = "Address deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}