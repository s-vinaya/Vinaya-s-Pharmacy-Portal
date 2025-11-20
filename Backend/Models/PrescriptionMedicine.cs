using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactPharmacyPortal.Models
{
    public class PrescriptionMedicine
    {
        [Key]
        public int PrescriptionMedicineId { get; set; }

        [Required]
        public int PrescriptionId { get; set; }

        [Required]
        public int MedicineId { get; set; }

        [Required]
        public int Quantity { get; set; }

        public string Dosage { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
        
        // Approval fields
        public bool IsApproved { get; set; } = false;
        public string RejectionReason { get; set; } = string.Empty;
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedBy { get; set; } // Pharmacist who reviewed

        [ForeignKey(nameof(PrescriptionId))]
        public Prescription Prescription { get; set; }

        [ForeignKey(nameof(MedicineId))]
        public Medicine Medicine { get; set; }
    }
}