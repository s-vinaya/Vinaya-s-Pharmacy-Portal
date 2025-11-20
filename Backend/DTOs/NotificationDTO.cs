using System;
using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class NotificationDTO
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNotificationDto
    {
        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string Title { get; set; }

        [Required, MaxLength(255)]
        public string Message { get; set; }
    }

    public class UpdateNotificationDto
    {
        [Required, MaxLength(100)]
        public string Title { get; set; }

        [Required, MaxLength(255)]
        public string Message { get; set; }

        public bool IsRead { get; set; }
    }
}
