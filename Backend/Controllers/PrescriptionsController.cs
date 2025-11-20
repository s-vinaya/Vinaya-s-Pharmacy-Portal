using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionsController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<PrescriptionDto>> UploadPrescription(IFormFile prescriptionFile, int userId, int? orderId = null)
        {
            try
            {
                if (prescriptionFile == null || prescriptionFile.Length == 0)
                    return BadRequest("Prescription file is required");

                var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(prescriptionFile.ContentType.ToLower()))
                    return BadRequest("Only PDF and image files (JPG, PNG, GIF) are allowed");

                if (prescriptionFile.Length > 5 * 1024 * 1024)
                    return BadRequest("File size cannot exceed 5MB");

                var prescription = await _prescriptionService.UploadPrescriptionAsync(prescriptionFile, userId, orderId);
                return Ok(prescription);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Download prescription file as binary content
        [HttpGet("{id}/download")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<IActionResult> DownloadPrescription(int id)
        {
            try
            {
                var fileDownload = await _prescriptionService.DownloadPrescriptionAsync(id);
                if (fileDownload == null)
                    return NotFound("Prescription file not found");

                return File(fileDownload.FileContent, fileDownload.ContentType, fileDownload.FileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptions()
        {
            try
            {
                var prescriptions = await _prescriptionService.GetAllAsync();
                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<PrescriptionDto>> GetPrescription(int id)
        {
            try
            {
                var prescription = await _prescriptionService.GetByIdAsync(id);
                if (prescription == null) return NotFound(new { message = "Prescription not found" });
                return Ok(prescription);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByUser(int userId)
        {
            try
            {
                var prescriptions = await _prescriptionService.GetByUserIdAsync(userId);
                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Filter prescriptions by status (Pending, Verified, Rejected)
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByStatus(PrescriptionStatus status)
        {
            try
            {
                var prescriptions = await _prescriptionService.GetByStatusAsync(status);
                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get prescriptions linked to a specific order
        [HttpGet("order/{orderId}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByOrder(int orderId)
        {
            try
            {
                var prescriptions = await _prescriptionService.GetByOrderIdAsync(orderId);
                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<IActionResult> UpdatePrescription(int id, UpdatePrescriptionDto prescriptionDto)
        {
            try
            {
                await _prescriptionService.UpdateAsync(id, prescriptionDto);
                return Ok(new { message = "Prescription updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Pharmacist verifies prescription as valid
        [HttpPut("{id}/verify")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<IActionResult> VerifyPrescription(int id, [FromBody] int pharmacistId)
        {
            try
            {
                await _prescriptionService.VerifyPrescriptionAsync(id, pharmacistId);
                return Ok(new { message = "Prescription verified successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        // Verify individual medicines within a prescription
        [HttpPost("{id}/verify-medicines")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<IActionResult> VerifyPrescriptionMedicines(int id, [FromBody] PrescriptionVerificationDTO verification)
        {
            try
            {
                await _prescriptionService.VerifyMedicinesAsync(id, verification);
                return Ok(new { message = "Prescription medicines verified successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get medicines awaiting verification for a prescription
        [HttpGet("{id}/pending-medicines")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<ActionResult<List<MedicineVerificationDTO>>> GetPendingMedicines(int id)
        {
            try
            {
                var medicines = await _prescriptionService.GetPendingMedicinesAsync(id);
                return Ok(medicines);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Search prescriptions by user ID or prescription ID
        [HttpGet("search")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> SearchPrescriptions([FromQuery] string searchTerm)
        {
            try
            {
                var prescriptions = await _prescriptionService.GetAllAsync();
                
                if (string.IsNullOrEmpty(searchTerm))
                    return Ok(prescriptions);
                
                var filteredPrescriptions = prescriptions.Where(p => 
                    p.PrescriptionId.ToString().Contains(searchTerm) ||
                    p.UserId.ToString().Contains(searchTerm)
                ).ToList();
                
                return Ok(filteredPrescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("count")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<int>> GetPrescriptionsCount()
        {
            try
            {
                var prescriptions = await _prescriptionService.GetAllAsync();
                return Ok(prescriptions.Count());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            try
            {
                await _prescriptionService.DeleteAsync(id);
                return Ok(new { message = "Prescription deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}