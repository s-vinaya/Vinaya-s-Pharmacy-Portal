using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class MedicineCategoryDTO
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class CreateMedicineCategoryDto
    {
        [Required, MaxLength(100)]
        public string CategoryName { get; set; }
    }

    public class UpdateMedicineCategoryDto
    {
        [Required, MaxLength(100)]
        public string CategoryName { get; set; }
    }
}
