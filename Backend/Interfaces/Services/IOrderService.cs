using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDto>> GetAllAsync();
        Task<OrderDto> GetByIdAsync(int id);
        Task<IEnumerable<OrderDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<OrderDto>> GetByStatusAsync(OrderStatus status);
        Task<OrderDto> CreateAsync(CreateOrderDto orderDto);
        Task UpdateStatusAsync(int id, UpdateOrderStatusDto statusDto);
        Task<(bool CanUpdate, string Reason)> CanUpdateStatusAsync(int orderId, OrderStatus newStatus);
        Task<decimal> CalculateOrderTotalAsync(int orderId);
        Task DeleteAsync(int id, string userRole = null);
        Task RecalculateAllOrderTotalsAsync();
    }
}
