using ReactPharmacyPortal.DTOs;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IMedicineService
    {
        Task<IEnumerable<MedicineDto>> GetAllAsync();
        Task<MedicineDto> GetByIdAsync(int id);
        Task<IEnumerable<MedicineDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<MedicineDto>> SearchByNameAsync(string name);
        Task<IEnumerable<MedicineDto>> GetExpiringMedicinesAsync(int daysFromNow);
        Task<IEnumerable<MedicineDto>> GetLowStockMedicinesAsync(int threshold);
        Task<MedicineDto> CreateAsync(CreateMedicineDto medicineDto);
        Task UpdateAsync(int id, UpdateMedicineDto medicineDto);
        Task UpdateStockAsync(int id, int newStock);
        Task DeleteAsync(int id);
    }
}
