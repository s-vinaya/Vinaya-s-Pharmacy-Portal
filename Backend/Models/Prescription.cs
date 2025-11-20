using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Models
{
    public class Prescription
    {
        [Key]
        public int PrescriptionId { get; set; }

        [Required]
        public int UserId { get; set; }  

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [Required, Url]
        public string FileUrl { get; set; } = string.Empty;

        [Required]
        public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Pending;



        public DateTime UploadedAt { get; set; } = DateTime.Now;

        [MaxLength(500)]
        public string Remarks { get; set; } = string.Empty;

        public ICollection<PrescriptionMedicine> PrescriptionMedicines { get; set; } = new List<PrescriptionMedicine>();
    }
}
