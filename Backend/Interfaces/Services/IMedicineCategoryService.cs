using ReactPharmacyPortal.DTOs;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IMedicineCategoryService
    {
        Task<IEnumerable<MedicineCategoryDTO>> GetAllAsync();
        Task<MedicineCategoryDTO> GetByIdAsync(int id);
        Task<MedicineCategoryDTO> CreateAsync(CreateMedicineCategoryDto categoryDto);
        Task UpdateAsync(int id, UpdateMedicineCategoryDto categoryDto);
        Task DeleteAsync(int id);
    }
}
