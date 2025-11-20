using System.ComponentModel.DataAnnotations;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string Salt { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ResetToken { get; set; } = string.Empty;

        public DateTime ResetTokenExpiry { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.Customer;

        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string Phone { get; set; } = string.Empty;

        // Pharmacist-specific fields
        [MaxLength(50)]
        public string? LicenseNumber { get; set; }

        public int? YearsOfExperience { get; set; }

        public DateTime? LicenseExpiryDate { get; set; }

        [MaxLength(100)]
        public string? Qualification { get; set; }

        [MaxLength(50)]
        public string? StateOfLicense { get; set; }

        public UserStatus Status { get; set; } = UserStatus.Active;

        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Address> Addresses { get; set; } = new List<Address>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}
