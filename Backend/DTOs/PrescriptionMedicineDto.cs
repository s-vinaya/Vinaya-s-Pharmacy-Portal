using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class PrescriptionMedicineDto
    {
        public int PrescriptionMedicineId { get; set; }
        public int PrescriptionId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
    }

    public class CreatePrescriptionMedicineDto
    {
        [Required]
        public int MedicineId { get; set; }
        
        [Required, Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public string Dosage { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
    }
}