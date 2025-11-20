using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Enums;
using Microsoft.AspNetCore.Http;

namespace ReactPharmacyPortal.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _repo;
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;

        public PrescriptionService(IPrescriptionRepository repo, IUserRepository userRepo, IMapper mapper)
        {
            _repo = repo;
            _userRepo = userRepo;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PrescriptionDto>> GetAllAsync()
        {
            var prescriptions = await _repo.GetAllAsync();
            var sortedPrescriptions = prescriptions.OrderByDescending(p => p.UploadedAt);
            return _mapper.Map<IEnumerable<PrescriptionDto>>(sortedPrescriptions);
        }

        public async Task<PrescriptionDto> GetByIdAsync(int id)
        {
            var prescription = await _repo.GetByIdAsync(id);
            if (prescription == null) return null;
            return _mapper.Map<PrescriptionDto>(prescription);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetByUserIdAsync(int userId)
        {
            if (userId <= 0)
                return new List<PrescriptionDto>();

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return new List<PrescriptionDto>();

            var prescriptions = await _repo.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<PrescriptionDto>>(prescriptions);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetByStatusAsync(PrescriptionStatus status)
        {
            var prescriptions = await _repo.GetAllAsync();
            var filtered = prescriptions.Where(p => p.Status == status);
            return _mapper.Map<IEnumerable<PrescriptionDto>>(filtered);
        }

        public async Task<PrescriptionDto> CreateAsync(CreatePrescriptionDto prescriptionDto)
        {
            var prescription = _mapper.Map<Prescription>(prescriptionDto);
            prescription.Status = PrescriptionStatus.Pending;
            prescription.UploadedAt = DateTime.UtcNow;
            var createdPrescription = await _repo.CreateAsync(prescription);
            return _mapper.Map<PrescriptionDto>(createdPrescription);
        }

        public async Task UpdateAsync(int id, UpdatePrescriptionDto prescriptionDto)
        {
            var prescription = await _repo.GetByIdAsync(id);
            if (prescription != null)
            {
                prescription.Status = prescriptionDto.Status;
                prescription.Remarks = string.IsNullOrWhiteSpace(prescriptionDto.Remarks) ? "No reason provided" : prescriptionDto.Remarks;
                await _repo.UpdateAsync(prescription);
            }
        }

        public async Task VerifyPrescriptionAsync(int id, int pharmacistId)
        {
            var prescription = await _repo.GetByIdAsync(id);
            if (prescription != null)
            {
                prescription.Status = PrescriptionStatus.Verified;
                await _repo.UpdateAsync(prescription);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }

        public async Task<PrescriptionDto> UploadPrescriptionAsync(IFormFile prescriptionFile, int userId, int? orderId = null)
        {
            var fileExtension = Path.GetExtension(prescriptionFile.FileName).ToLower();
            var fileName = orderId.HasValue ? 
                $"prescription_order_{orderId}_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}" :
                $"prescription_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
            var filePath = Path.Combine("uploads", "prescriptions", fileName);
            
            Directory.CreateDirectory(Path.GetDirectoryName(filePath));
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await prescriptionFile.CopyToAsync(stream);
            }

            var prescription = new Prescription
            {
                UserId = userId,
                FileUrl = filePath,
                Status = PrescriptionStatus.Pending,
                UploadedAt = DateTime.UtcNow
            };
            
            var createdPrescription = await _repo.CreateAsync(prescription);
            return _mapper.Map<PrescriptionDto>(createdPrescription);
        }

        public async Task UpdatePrescriptionFileAsync(int id, IFormFile pdfFile)
        {
            var prescription = await _repo.GetByIdAsync(id);
            if (prescription == null) return;

            var fileName = $"prescription_{prescription.UserId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            var filePath = Path.Combine("uploads", "prescriptions", fileName);
            
            Directory.CreateDirectory(Path.GetDirectoryName(filePath));
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await pdfFile.CopyToAsync(stream);
            }

            prescription.FileUrl = filePath;
            await _repo.UpdateAsync(prescription);
        }

        public async Task<FileDownloadDto> DownloadPrescriptionAsync(int id)
        {
            var prescription = await _repo.GetByIdAsync(id);
            if (prescription == null || !File.Exists(prescription.FileUrl))
                return null;

            var fileContent = await File.ReadAllBytesAsync(prescription.FileUrl);
            var fileName = Path.GetFileName(prescription.FileUrl);
            var fileExtension = Path.GetExtension(fileName).ToLower();
            
            var contentType = fileExtension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };

            return new FileDownloadDto
            {
                FileContent = fileContent,
                FileName = fileName,
                ContentType = contentType
            };
        }

        public async Task<IEnumerable<PrescriptionDto>> GetByOrderIdAsync(int orderId)
        {
            var prescriptions = await _repo.GetAllAsync();
            var filtered = prescriptions.Where(p => p.FileUrl.Contains($"order_{orderId}_"));
            return _mapper.Map<IEnumerable<PrescriptionDto>>(filtered);
        }

        public async Task<PrescriptionDto> UploadPrescriptionWithMedicinesAsync(IFormFile prescriptionFile, int userId, List<CreatePrescriptionMedicineDto> medicines, int? orderId = null)
        {
            return await UploadPrescriptionAsync(prescriptionFile, userId, orderId);
        }

        public async Task<PrescriptionDto> UploadForOrderAsync(PrescriptionUploadDTO dto)
        {
            // This method signature exists in interface but DTO doesn't exist
            // Return null or throw NotImplementedException until DTO is created
            throw new NotImplementedException("PrescriptionUploadDTO not implemented");
        }

        public async Task VerifyMedicinesAsync(int prescriptionId, PrescriptionVerificationDTO verification)
        {
            // Implementation for verifying individual medicines in prescription
            var prescription = await _repo.GetByIdAsync(prescriptionId);
            if (prescription != null)
            {
                
                prescription.Status = PrescriptionStatus.Verified;
                await _repo.UpdateAsync(prescription);
            }
        }

        public async Task<List<MedicineVerificationDTO>> GetPendingMedicinesAsync(int prescriptionId)
        {
           
            return await Task.FromResult(new List<MedicineVerificationDTO>());
        }
    }
}