using System;
using System.ComponentModel.DataAnnotations;

using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.DTOs
{
    public class UserDTO
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string ResetToken { get; set; } = string.Empty;
        
        // Pharmacist-specific fields
        public string? LicenseNumber { get; set; }
        public int? YearsOfExperience { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public string? Qualification { get; set; }
        public string? StateOfLicense { get; set; }
    }

    public class RegisterUserDto
    {
        [Required, MaxLength(100), MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string Name { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required, MinLength(8), MaxLength(255)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
            ErrorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")]
        public string Password { get; set; }

        public UserRole Role { get; set; }

        [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string Phone { get; set; }
        
        // Pharmacist-specific fields (optional for customers)
        [MaxLength(50)]
        public string? LicenseNumber { get; set; }
        
        public int? YearsOfExperience { get; set; }
        
        public DateTime? LicenseExpiryDate { get; set; }
        
        [MaxLength(100)]
        public string? Qualification { get; set; }
        
        [MaxLength(50)]
        public string? StateOfLicense { get; set; }
    }

    public class RegisterCustomerDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required, MinLength(8), MaxLength(255)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
            ErrorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")]
        public string Password { get; set; }

        [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string Phone { get; set; }
    }

    public class RegisterPharmacistDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required, MinLength(8), MaxLength(255)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
            ErrorMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")]
        public string Password { get; set; }

        [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string Phone { get; set; }

        [Required, MaxLength(50), MinLength(5, ErrorMessage = "License number must be at least 5 characters")]
        public string LicenseNumber { get; set; }

        [Required, Range(0, 50, ErrorMessage = "Years of experience must be between 0 and 50")]
        public int YearsOfExperience { get; set; }

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        [Required, MaxLength(100), MinLength(2, ErrorMessage = "Qualification must be at least 2 characters")]
        public string Qualification { get; set; }

        [Required, MaxLength(50), MinLength(2, ErrorMessage = "State of license must be at least 2 characters")]
        public string StateOfLicense { get; set; }
    }

    public class UpdateUserStatusDto
    {
        [Required]
        public UserStatus Status { get; set; }
        
        [MaxLength(500)]
        public string? RejectionReason { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required, MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        public string Password { get; set; }
    }
}
