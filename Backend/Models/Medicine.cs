using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactPharmacyPortal.Models
{
    public class Medicine
    {
        [Key]
        public int MedicineId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }  

        [Required]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        public bool RequiresPrescription { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public DateTime ExpiryDate { get; set; }

        [Required]
        public int CreatedBy { get; set; } // FK to User

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(CategoryId))]
        public MedicineCategory MedicineCategory { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public User CreatedUser { get; set; }
    }
}
