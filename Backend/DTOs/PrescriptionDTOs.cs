using System;
using System.ComponentModel.DataAnnotations;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.DTOs
{
    public class PrescriptionDto
    {
        public int PrescriptionId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(255)]
        public string FileUrl { get; set; } = string.Empty;

        [Required]
        public PrescriptionStatus Status { get; set; }

        [MaxLength(500)]
        public string Remarks { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }
        
        public List<PrescriptionMedicineDto> Medicines { get; set; } = new List<PrescriptionMedicineDto>();
    }

    public class CreatePrescriptionDto
    {
        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(255)]
        public string FileUrl { get; set; } = string.Empty; // file URL after upload
    }

    public class UpdatePrescriptionDto
    {
        [Required]
        public PrescriptionStatus Status { get; set; }

        [MaxLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }
}
