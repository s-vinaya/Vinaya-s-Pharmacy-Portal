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
    public class MedicineCategoryService : IMedicineCategoryService
    {
        private readonly IMedicineCategoryRepository _repo;
        private readonly IMedicineRepository _medicineRepo;
        private readonly IMapper _mapper;

        public MedicineCategoryService(IMedicineCategoryRepository repo, IMedicineRepository medicineRepo, IMapper mapper)
        {
            _repo = repo;
            _medicineRepo = medicineRepo;
            _mapper = mapper;
        }

        // Get all medicine categories sorted by name
        public async Task<IEnumerable<MedicineCategoryDTO>> GetAllAsync()
        {
            var categories = await _repo.GetAllAsync();
            var activeCategories = categories.OrderBy(c => c.CategoryName);
            return _mapper.Map<IEnumerable<MedicineCategoryDTO>>(activeCategories);
        }

        // Get a specific category by ID with validation
        public async Task<MedicineCategoryDTO> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Category ID must be greater than zero");

            var category = await _repo.GetByIdAsync(id);
            if (category == null)
                return null;

            return _mapper.Map<MedicineCategoryDTO>(category);
        }

        // Create a new medicine category with duplicate check
        public async Task<MedicineCategoryDTO> CreateAsync(CreateMedicineCategoryDto categoryDto)
        {
            if (string.IsNullOrWhiteSpace(categoryDto.CategoryName) || categoryDto.CategoryName.Length < 2)
                throw new ArgumentException("Category name must be at least 2 characters long");

            if (categoryDto.CategoryName.Length > 100)
                throw new ArgumentException("Category name cannot exceed 100 characters");

            var existingCategories = await _repo.GetAllAsync();
            if (existingCategories.Any(c => c.CategoryName.ToLower().Trim() == categoryDto.CategoryName.ToLower().Trim()))
                throw new InvalidOperationException($"Category '{categoryDto.CategoryName}' already exists");

            var category = _mapper.Map<MedicineCategory>(categoryDto);
            var createdCategory = await _repo.CreateAsync(category);
            return _mapper.Map<MedicineCategoryDTO>(createdCategory);
        }

        // Update category name with duplicate check
        public async Task UpdateAsync(int id, UpdateMedicineCategoryDto categoryDto)
        {
            var existingCategory = await _repo.GetByIdAsync(id);
            if (existingCategory == null)
                throw new ArgumentException("Medicine category not found");

            if (string.IsNullOrWhiteSpace(categoryDto.CategoryName) || categoryDto.CategoryName.Length < 2)
                throw new ArgumentException("Category name must be at least 2 characters long");

            var allCategories = await _repo.GetAllAsync();
            if (allCategories.Any(c => c.CategoryId != id && c.CategoryName.ToLower().Trim() == categoryDto.CategoryName.ToLower().Trim()))
                throw new InvalidOperationException($"Category '{categoryDto.CategoryName}' already exists");

            existingCategory.CategoryName = categoryDto.CategoryName.Trim();
            await _repo.UpdateAsync(existingCategory);
        }

        // Delete a category (only if no medicines exist in it)
        public async Task DeleteAsync(int id)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null)
                throw new ArgumentException("Medicine category not found");

            var categoryMedicines = await _medicineRepo.GetByCategoryAsync(id);
            if (categoryMedicines.Any())
                throw new InvalidOperationException($"Cannot delete category '{category.CategoryName}' because it contains {categoryMedicines.Count()} medicines. Please move or delete the medicines first.");

            await _repo.DeleteAsync(id);
        }
    }
}