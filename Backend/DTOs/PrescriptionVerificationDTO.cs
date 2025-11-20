namespace ReactPharmacyPortal.DTOs
{
    public class PrescriptionVerificationDTO
    {
        public int PrescriptionId { get; set; }
        public List<MedicineVerificationDTO> Medicines { get; set; } = new();
    }

    public class MedicineVerificationDTO
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int RequestedQuantity { get; set; }
        public bool IsApproved { get; set; }
        public int ApprovedQuantity { get; set; }
        public string RejectionReason { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
    }

    public class PrescriptionUploadDTO
    {
        public int OrderId { get; set; }
        public List<int> MedicineIds { get; set; } = new();
        public IFormFile PrescriptionFile { get; set; }
    }
}