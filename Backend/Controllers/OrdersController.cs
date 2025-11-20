using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        
        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            try
            {
                var orders = await _orderService.GetAllAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var order = await _orderService.GetByIdAsync(id);
                if (order == null) return NotFound(new { message = "Order not found" });
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUser(int userId)
        {
            try
            {
                var orders = await _orderService.GetByUserIdAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent/{days}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetRecentOrders(int days = 7)
        {
            try
            {
                var orders = await _orderService.GetAllAsync();
                var recentOrders = orders.Where(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-days));
                return Ok(recentOrders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get orders filtered by status (Pending, Processing, Delivered, etc.)
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByStatus(OrderStatus status)
        {
            try
            {
                var orders = await _orderService.GetByStatusAsync(status);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Calculate total amount for a specific order
        [HttpGet("{id}/total")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<decimal>> GetOrderTotal(int id)
        {
            try
            {
                var total = await _orderService.CalculateOrderTotalAsync(id);
                return Ok(total);
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto orderDto)
        {
            try
            {
                var createdOrder = await _orderService.CreateAsync(orderDto);
                return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.OrderId }, createdOrder);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Check if order status can be updated (prescription validation)
        [HttpGet("{id}/can-update-status/{status}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<object>> CanUpdateOrderStatus(int id, OrderStatus status)
        {
            try
            {
                var (canUpdate, reason) = await _orderService.CanUpdateStatusAsync(id, status);
                return Ok(new { canUpdate, reason });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Update order status 
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto statusDto)
        {
            try
            {
                await _orderService.UpdateStatusAsync(id, statusDto);
                return Ok(new { message = "Order status updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Pharmacist,Customer")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
                await _orderService.DeleteAsync(id, userRole);
                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get total count of all orders
        [HttpGet("count")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<int>> GetOrdersCount()
        {
            try
            {
                var orders = await _orderService.GetAllAsync();
                return Ok(orders.Count());
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get count of active orders (Pending + Processing)
        [HttpGet("active/count")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<int>> GetActiveOrdersCount()
        {
            try
            {
                var orders = await _orderService.GetAllAsync();
                var activeCount = orders.Count(o => o.Status.ToString() == "Pending" || o.Status.ToString() == "Processing");
                return Ok(activeCount);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Recalculate total amounts for all orders (Admin only)
        [HttpPost("recalculate-totals")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RecalculateOrderTotals()
        {
            try
            {
                await _orderService.RecalculateAllOrderTotalsAsync();
                return Ok(new { message = "Order totals recalculated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }
    }
}