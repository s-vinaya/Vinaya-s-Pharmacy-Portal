using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class AddressDTO
    {
        public int AddressId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, MaxLength(255)]
        public string AddressLine1 { get; set; }

        [MaxLength(255)]
        public string AddressLine2 { get; set; }

        [Required, MaxLength(100)]
        public string City { get; set; }

        [Required, MaxLength(100)]
        public string State { get; set; }

        [Required, MaxLength(10)]
        public string PostalCode { get; set; }

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsDefault { get; set; }
    }

    public class CreateAddressDto
    {
        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, MaxLength(255)]
        public string AddressLine1 { get; set; }

        [MaxLength(255)]
        public string AddressLine2 { get; set; }

        [Required, MaxLength(100)]
        public string City { get; set; }

        [Required, MaxLength(100)]
        public string State { get; set; }

        [Required, MaxLength(10)]
        public string PostalCode { get; set; }

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressDto
    {
        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, MaxLength(255)]
        public string AddressLine1 { get; set; }

        [MaxLength(255)]
        public string AddressLine2 { get; set; }

        [Required, MaxLength(100)]
        public string City { get; set; }

        [Required, MaxLength(100)]
        public string State { get; set; }

        [Required, MaxLength(10)]
        public string PostalCode { get; set; }

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; }

        public bool IsDefault { get; set; }
    }
}
