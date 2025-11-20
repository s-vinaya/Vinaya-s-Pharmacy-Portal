using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public MedicinesController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicines()
        {
            try
            {
                var medicines = await _medicineService.GetAllAsync();
                return Ok(medicines);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<MedicineDto>> GetMedicine(int id)
        {
            try
            {
                var medicine = await _medicineService.GetByIdAsync(id);
                if (medicine == null) return NotFound(new { message = "Medicine not found" });
                return Ok(medicine);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("category/{categoryId}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicinesByCategory(int categoryId)
        {
            try
            {
                var medicines = await _medicineService.GetByCategoryAsync(categoryId);
                return Ok(medicines);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
        [HttpGet("search")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> SearchMedicines([FromQuery] string name)
        {
            try
            {
                var medicines = await _medicineService.SearchByNameAsync(name);
                return Ok(medicines);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Get medicines expiring within specified days(default 30 days)
        [HttpGet("expiring")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetExpiringMedicines([FromQuery] int days = 30)
        {
            try
            {
                var medicines = await _medicineService.GetExpiringMedicinesAsync(days);
                return Ok(medicines);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get medicines with stock below threshold (default 10 )
        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetLowStockMedicines([FromQuery] int threshold = 10)
        {
            try
            {
                var medicines = await _medicineService.GetLowStockMedicinesAsync(threshold);
                return Ok(medicines);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPost]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<MedicineDto>> CreateMedicine(CreateMedicineDto medicineDto)
        {
            try
            {
                var createdMedicine = await _medicineService.CreateAsync(medicineDto);
                return CreatedAtAction(nameof(GetMedicine), new { id = createdMedicine.MedicineId }, createdMedicine);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> UpdateMedicine(int id, UpdateMedicineDto medicineDto)
        {
            try
            {
                await _medicineService.UpdateAsync(id, medicineDto);
                return Ok(new { message = "Medicine updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPut("{id}/stock")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> UpdateMedicineStock(int id, [FromBody] int newStock)
        {
            try
            {
                await _medicineService.UpdateStockAsync(id, newStock);
                return Ok(new { message = "Medicine stock updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            try
            {
                // Check if medicine exists first
                var medicine = await _medicineService.GetByIdAsync(id);
                if (medicine == null)
                {
                    return Ok(new { success = false, message = "Medicine not found" });
                }

                await _medicineService.DeleteAsync(id);
                return Ok(new { success = true, message = "Medicine deleted successfully" });
            }
            catch (ArgumentException ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = $"An error occurred while deleting the medicine: {ex.Message}" });
            }
        }

       
        [HttpGet("count")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<int>> GetMedicinesCount()
        {
            try
            {
                var medicines = await _medicineService.GetAllAsync();
                return Ok(medicines.Count());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("low-stock/count")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<int>> GetLowStockMedicinesCount([FromQuery] int threshold = 10)
        {
            try
            {
                var medicines = await _medicineService.GetLowStockMedicinesAsync(threshold);
                return Ok(medicines.Count());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}