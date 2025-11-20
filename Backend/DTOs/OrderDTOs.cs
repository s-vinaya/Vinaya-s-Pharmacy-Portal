using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.DTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public int AddressId { get; set; }
        public int? PrescriptionId { get; set; }
        public decimal? TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
    }

    public class CreateOrderDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int AddressId { get; set; }

        public int? PrescriptionId { get; set; }

        [Required]
        public List<CreateOrderItemDto> OrderItems { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
