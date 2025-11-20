using System.ComponentModel.DataAnnotations;

namespace ReactPharmacyPortal.DTOs
{
    public class OrderItemDTO
    {
        public int OrderItemId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int MedicineId { get; set; }

        [Required, Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class UpdateOrderItemDto
    {
        [Required, Range(0, 100)]
        public int Quantity { get; set; }
    }
}
