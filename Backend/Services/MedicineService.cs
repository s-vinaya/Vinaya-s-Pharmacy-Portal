using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Models;

namespace ReactPharmacyPortal.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly IMedicineRepository _repo;
        private readonly IMedicineCategoryRepository _categoryRepo;
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;

        public MedicineService(IMedicineRepository repo, IMedicineCategoryRepository categoryRepo, IUserRepository userRepo, IMapper mapper)
        {
            _repo = repo;
            _categoryRepo = categoryRepo;
            _userRepo = userRepo;
            _mapper = mapper;
        }

        // Get all non-expired medicines ordered by name
        public async Task<IEnumerable<MedicineDto>> GetAllAsync()
        {
            var medicines = await _repo.GetAllAsync();
            var activeMedicines = medicines.Where(m => m.ExpiryDate > DateTime.Now).OrderBy(m => m.Name);
            return _mapper.Map<IEnumerable<MedicineDto>>(activeMedicines);
        }

        // Get a specific medicine by ID with validation
        public async Task<MedicineDto> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Medicine ID must be greater than zero");

            var medicine = await _repo.GetByIdAsync(id);
            if (medicine == null)
                return null;

            return _mapper.Map<MedicineDto>(medicine);
        }

        // Get all non-expired medicines in a specific category
        public async Task<IEnumerable<MedicineDto>> GetByCategoryAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Category ID must be greater than zero");

            var category = await _categoryRepo.GetByIdAsync(categoryId);
            if (category == null)
                throw new ArgumentException($"Category with ID {categoryId} not found");

            var medicines = await _repo.GetByCategoryAsync(categoryId);
            var activeMedicines = medicines.Where(m => m.ExpiryDate > DateTime.Now).OrderBy(m => m.Name);
            return _mapper.Map<IEnumerable<MedicineDto>>(activeMedicines);
        }

        // Create a new medicine with validation (name, price, expiry, category)
        public async Task<MedicineDto> CreateAsync(CreateMedicineDto medicineDto)
        {
            var category = await _categoryRepo.GetByIdAsync(medicineDto.CategoryId);
            if (category == null)
                throw new ArgumentException($"Category with ID {medicineDto.CategoryId} not found");

            var user = await _userRepo.GetByIdAsync(medicineDto.CreatedBy);
            if (user == null)
                throw new ArgumentException($"User with ID {medicineDto.CreatedBy} not found");

            if (string.IsNullOrWhiteSpace(medicineDto.Name) || medicineDto.Name.Length < 2)
                throw new ArgumentException("Medicine name must be at least 2 characters long");

            if (medicineDto.Price <= 0)
                throw new ArgumentException("Medicine price must be greater than zero");

            if (medicineDto.ExpiryDate <= DateTime.Now)
                throw new ArgumentException("Expiry date must be in the future");

            var existingMedicines = await _repo.GetAllAsync();
            if (existingMedicines.Any(m => m.Name.ToLower().Trim() == medicineDto.Name.ToLower().Trim()))
                throw new InvalidOperationException($"Medicine '{medicineDto.Name}' already exists");

            var medicine = _mapper.Map<Medicine>(medicineDto);
            medicine.CreatedAt = DateTime.UtcNow;
            
            var createdMedicine = await _repo.CreateAsync(medicine);
            return _mapper.Map<MedicineDto>(createdMedicine);
        }

        // Update medicine details with validation
        public async Task UpdateAsync(int id, UpdateMedicineDto medicineDto)
        {
            var existingMedicine = await _repo.GetByIdAsync(id);
            if (existingMedicine == null)
                throw new ArgumentException("Medicine not found");

            var category = await _categoryRepo.GetByIdAsync(medicineDto.CategoryId);
            if (category == null)
                throw new ArgumentException($"Category with ID {medicineDto.CategoryId} not found");

            if (string.IsNullOrWhiteSpace(medicineDto.Name) || medicineDto.Name.Length < 2)
                throw new ArgumentException("Medicine name must be at least 2 characters long");

            if (medicineDto.Price <= 0)
                throw new ArgumentException("Medicine price must be greater than zero");

            var allMedicines = await _repo.GetAllAsync();
            if (allMedicines.Any(m => m.MedicineId != id && m.Name.ToLower().Trim() == medicineDto.Name.ToLower().Trim()))
                throw new InvalidOperationException($"Medicine '{medicineDto.Name}' already exists");

            existingMedicine.Name = medicineDto.Name.Trim();
            existingMedicine.Description = medicineDto.Description?.Trim() ?? string.Empty;
            existingMedicine.CategoryId = medicineDto.CategoryId;
            existingMedicine.Price = medicineDto.Price;
            existingMedicine.Stock = medicineDto.Stock;
            existingMedicine.RequiresPrescription = medicineDto.RequiresPrescription;
            existingMedicine.ExpiryDate = medicineDto.ExpiryDate;
            existingMedicine.ImageUrl = medicineDto.ImageUrl ?? string.Empty;

            await _repo.UpdateAsync(existingMedicine);
        }

        // Delete a medicine from inventory
        public async Task DeleteAsync(int id)
        {
            var medicine = await _repo.GetByIdAsync(id);
            if (medicine == null)
                throw new ArgumentException("Medicine not found");

            await _repo.DeleteAsync(id);
        }

        // Search medicines by name (case-insensitive)
        public async Task<IEnumerable<MedicineDto>> SearchByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Search name is required");

            var medicines = await _repo.GetAllAsync();
            var filtered = medicines.Where(m => m.Name.Contains(name, StringComparison.OrdinalIgnoreCase));
            return _mapper.Map<IEnumerable<MedicineDto>>(filtered);
        }

        // Get medicines expiring within specified days
        public async Task<IEnumerable<MedicineDto>> GetExpiringMedicinesAsync(int days)
        {
            var medicines = await _repo.GetAllAsync();
            var expiring = medicines.Where(m => m.ExpiryDate <= DateTime.Now.AddDays(days));
            return _mapper.Map<IEnumerable<MedicineDto>>(expiring);
        }

        // Get medicines with stock below threshold
        public async Task<IEnumerable<MedicineDto>> GetLowStockMedicinesAsync(int threshold)
        {
            var medicines = await _repo.GetAllAsync();
            var lowStock = medicines.Where(m => m.Stock <= threshold);
            return _mapper.Map<IEnumerable<MedicineDto>>(lowStock);
        }

        // Update medicine stock quantity
        public async Task UpdateStockAsync(int id, int newStock)
        {
            var medicine = await _repo.GetByIdAsync(id);
            if (medicine == null)
                throw new ArgumentException("Medicine not found");

            if (newStock < 0)
                throw new ArgumentException("Stock cannot be negative");

            medicine.Stock = newStock;
            await _repo.UpdateAsync(medicine);
        }
    }
}