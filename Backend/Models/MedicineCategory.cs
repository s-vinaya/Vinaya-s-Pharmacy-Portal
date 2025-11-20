using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.Models
{
    public class MedicineCategory
    {
        [Key]
        public int CategoryId { get; set; }

        [Required, MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        public ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
    }
}
