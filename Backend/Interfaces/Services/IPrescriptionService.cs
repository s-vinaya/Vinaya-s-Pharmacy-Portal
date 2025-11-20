using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Enums;
using Microsoft.AspNetCore.Http;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IPrescriptionService
    {
        Task<IEnumerable<PrescriptionDto>> GetAllAsync();
        Task<PrescriptionDto> GetByIdAsync(int id);
        Task<IEnumerable<PrescriptionDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<PrescriptionDto>> GetByStatusAsync(PrescriptionStatus status);
        Task<PrescriptionDto> CreateAsync(CreatePrescriptionDto prescriptionDto);
        Task UpdateAsync(int id, UpdatePrescriptionDto prescriptionDto);
        Task VerifyPrescriptionAsync(int id, int pharmacistId);
        Task DeleteAsync(int id);
        Task<PrescriptionDto> UploadPrescriptionAsync(IFormFile prescriptionFile, int userId, int? orderId = null);
        Task<PrescriptionDto> UploadPrescriptionWithMedicinesAsync(IFormFile prescriptionFile, int userId, List<CreatePrescriptionMedicineDto> medicines, int? orderId = null);
        Task UpdatePrescriptionFileAsync(int id, IFormFile pdfFile);
        Task<FileDownloadDto> DownloadPrescriptionAsync(int id);
        Task<IEnumerable<PrescriptionDto>> GetByOrderIdAsync(int orderId);
        Task<PrescriptionDto> UploadForOrderAsync(PrescriptionUploadDTO dto);
        Task VerifyMedicinesAsync(int prescriptionId, PrescriptionVerificationDTO verification);
        Task<List<MedicineVerificationDTO>> GetPendingMedicinesAsync(int prescriptionId);
    }
}
