using System;
using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class MedicineDto
    {
        public int MedicineId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool RequiresPrescription { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateMedicineDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } 

        [MaxLength(255)]
        public string Description { get; set; } 

        [Required]
        public int CategoryId { get; set; } 

      
        public decimal Price { get; set; } = 0.01m;

       
        public int Stock { get; set; } = 0;

        public bool RequiresPrescription { get; set; } = false;

        [Required]
        public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddYears(2);

        [Required]
        public int CreatedBy { get; set; } = 4;

        public string ImageUrl { get; set; } = string.Empty;
    }

    public class UpdateMedicineDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(255)]
        public string Description { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required, Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool RequiresPrescription { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
    }
}
