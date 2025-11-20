using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Repositories;
using ReactPharmacyPortal.Interfaces.Services;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.Enums;

namespace ReactPharmacyPortal.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repo;
        private readonly IUserRepository _userRepo;
        private readonly IAddressRepository _addressRepo;
        private readonly IPrescriptionRepository _prescriptionRepo;
        private readonly IMedicineRepository _medicineRepo;
        private readonly IMapper _mapper;

        public OrderService(IOrderRepository repo, IUserRepository userRepo, IAddressRepository addressRepo, IPrescriptionRepository prescriptionRepo, IMedicineRepository medicineRepo, IMapper mapper)
        {
            _repo = repo;
            _userRepo = userRepo;
            _addressRepo = addressRepo;
            _prescriptionRepo = prescriptionRepo;
            _medicineRepo = medicineRepo;
            _mapper = mapper;
        }

        // Get all orders sorted by creation date (newest first)
        public async Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            var orders = await _repo.GetAllAsync();
            var sortedOrders = orders.OrderByDescending(o => o.CreatedAt).ToList();
            return _mapper.Map<IEnumerable<OrderDto>>(sortedOrders);
        }

        
        public async Task<OrderDto> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Order ID must be greater than zero");

            var order = await _repo.GetByIdAsync(id);
            if (order == null)
                return null;

            return _mapper.Map<OrderDto>(order);
        }

        // Get all orders for a specific user
        public async Task<IEnumerable<OrderDto>> GetByUserIdAsync(int userId)
        {
            if (userId <= 0)
                return new List<OrderDto>();

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return new List<OrderDto>();

            var orders = await _repo.GetByUserIdAsync(userId);
            var userOrders = orders.OrderByDescending(o => o.CreatedAt).ToList();
            return _mapper.Map<IEnumerable<OrderDto>>(userOrders);
        }

        // Create a new order with validation (user, address, items)
        public async Task<OrderDto> CreateAsync(CreateOrderDto orderDto)
        {
            var user = await _userRepo.GetByIdAsync(orderDto.UserId);
            if (user == null)
                throw new ArgumentException($"User with ID {orderDto.UserId} not found");

            var address = await _addressRepo.GetByIdAsync(orderDto.AddressId);
            if (address == null)
                throw new ArgumentException($"Address with ID {orderDto.AddressId} not found");

            if (orderDto.PrescriptionId.HasValue)
            {
                var prescription = await _prescriptionRepo.GetByIdAsync(orderDto.PrescriptionId.Value);
                if (prescription == null)
                    throw new ArgumentException($"Prescription with ID {orderDto.PrescriptionId} not found");
                
                if (prescription.UserId != orderDto.UserId)
                    throw new ArgumentException($"Prescription {orderDto.PrescriptionId} does not belong to user {orderDto.UserId}");
            }

            if (orderDto.OrderItems == null || !orderDto.OrderItems.Any())
                throw new ArgumentException("Order must contain at least one item");

            var order = _mapper.Map<Order>(orderDto);
            order.Status = OrderStatus.Pending;
            order.CreatedAt = DateTime.UtcNow;
            
            // Calculate total amount and set order item prices
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();
            
            foreach (var itemDto in orderDto.OrderItems)
            {
                var medicine = await _medicineRepo.GetByIdAsync(itemDto.MedicineId);
                if (medicine != null)
                {
                   
                    if (medicine.Stock < itemDto.Quantity)
                        throw new InvalidOperationException($"Insufficient stock for {medicine.Name}. Available: {medicine.Stock}, Requested: {itemDto.Quantity}");
                    
                    // Reduce stock
                    medicine.Stock -= itemDto.Quantity;
                    await _medicineRepo.UpdateAsync(medicine);
                    
                    var orderItem = new OrderItem
                    {
                        MedicineId = itemDto.MedicineId,
                        Quantity = itemDto.Quantity,
                        Price = medicine.Price
                    };
                    orderItems.Add(orderItem);
                    totalAmount += medicine.Price * itemDto.Quantity;
                }
            }
            
            order.OrderItems = orderItems;
            order.TotalAmount = totalAmount;
            
            var createdOrder = await _repo.CreateAsync(order);
            return _mapper.Map<OrderDto>(createdOrder);
        }

        // Update order status (Pending, Processing, Delivered)
        public async Task UpdateStatusAsync(int id, UpdateOrderStatusDto statusDto)
        {
            var existingOrder = await _repo.GetByIdAsync(id);
            if (existingOrder == null)
                throw new ArgumentException("Order not found");

            // Validate prescription status before allowing order status updates
            await ValidatePrescriptionForStatusUpdate(existingOrder, statusDto.Status);

            existingOrder.Status = statusDto.Status;
            await _repo.UpdateAsync(existingOrder);
        }

        // Check if order status can be updated (for frontend validation)
        public async Task<(bool CanUpdate, string Reason)> CanUpdateStatusAsync(int orderId, OrderStatus newStatus)
        {
            try
            {
                var order = await _repo.GetByIdAsync(orderId);
                if (order == null)
                    return (false, "Order not found");

                await ValidatePrescriptionForStatusUpdate(order, newStatus);
                return (true, string.Empty);
            }
            catch (InvalidOperationException ex)
            {
                return (false, ex.Message);
            }
            catch (Exception ex)
            {
                return (false, "Error validating prescription status");
            }
        }

        // Validate prescription status for order status updates
        private async Task ValidatePrescriptionForStatusUpdate(Order order, OrderStatus newStatus)
        {
            
            if (newStatus == OrderStatus.Processing || newStatus == OrderStatus.Shipped || newStatus == OrderStatus.Delivered)
            {
                // If order has a prescription, validate it's status
                if (order.PrescriptionId.HasValue)
                {
                    var prescription = await _prescriptionRepo.GetByIdAsync(order.PrescriptionId.Value);
                    
                    if (prescription == null)
                        throw new InvalidOperationException($"Prescription {order.PrescriptionId.Value} not found for order {order.OrderId}");
                    
                    
                    Console.WriteLine($"DEBUG: Order {order.OrderId} (User: {order.UserId}), Prescription {prescription.PrescriptionId} (User: {prescription.UserId}), Status: {prescription.Status}");
             
                    if (order.UserId != prescription.UserId)
                    {
                        Console.WriteLine($"WARNING: Order user {order.UserId} does not match prescription user {prescription.UserId}");
                    }
                    
                    Console.WriteLine($"DEBUG: About to check prescription status: {prescription.Status}");
                    
                    if (prescription.Status == PrescriptionStatus.Pending)
                    {
                        throw new InvalidOperationException("Review the prescription before updating status");
                    }
                    else if (prescription.Status == PrescriptionStatus.Rejected)
                    {
                        throw new InvalidOperationException("You cannot update order status as the prescription is rejected");
                    }
                    else if (prescription.Status == PrescriptionStatus.Verified)
                    {
                        Console.WriteLine($"DEBUG: Prescription is verified, allowing update");
                        // Allow the update to proceed
                        return;
                    }
                    else
                    {
                        Console.WriteLine($"DEBUG: Unknown status: {prescription.Status}");
                        throw new InvalidOperationException($"Unknown prescription status: {prescription.Status}");
                    }
                }
            }
        }

        
        public async Task DeleteAsync(int id, string userRole = null)
        {
            var order = await _repo.GetByIdAsync(id);
            if (order == null)
                throw new ArgumentException("Order not found");

            // Admin and Pharmacist can cancel orders regardless of status
            if (userRole != "Admin" && userRole != "Pharmacist")
            {
                // Customers can only cancel pending or processing orders
                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Processing)
                    throw new InvalidOperationException("Only pending or processing orders can be cancelled");
            }

            // Delete related prescription if it exists
            if (order.PrescriptionId.HasValue)
            {
                await _prescriptionRepo.DeleteAsync(order.PrescriptionId.Value);
            }

            await _repo.DeleteAsync(id);
        }

      
        public async Task<IEnumerable<OrderDto>> GetByStatusAsync(OrderStatus status)
        {
            var orders = await _repo.GetAllAsync();
            var filtered = orders.Where(o => o.Status == status).ToList();
            return _mapper.Map<IEnumerable<OrderDto>>(filtered);
        }

        // Calculate total amount for an order
        public async Task<decimal> CalculateOrderTotalAsync(int orderId)
        {
            var order = await _repo.GetByIdAsync(orderId);
            if (order == null)
                throw new ArgumentException("Order not found");

            return order.TotalAmount ?? 0;
        }

        // Recalculate and update total amounts for all orders
        public async Task RecalculateAllOrderTotalsAsync()
        {
            var orders = await _repo.GetAllAsync();
            
            foreach (var order in orders)
            {
                if (order.OrderItems != null && order.OrderItems.Any())
                {
                    decimal totalAmount = 0;
                    bool needsUpdate = false;
                    
                    foreach (var item in order.OrderItems)
                    {
                        if (item.Price <= 0)
                        {
                            if (item.Medicine != null)
                            {
                                item.Price = item.Medicine.Price;
                            }
                            else
                            {
                                // Fallback: fetch medicine price directly
                                var medicine = await _medicineRepo.GetByIdAsync(item.MedicineId);
                                if (medicine != null)
                                {
                                    item.Price = medicine.Price;
                                }
                            }
                            needsUpdate = true;
                        }
                        totalAmount += item.Price * item.Quantity;
                    }
                    
                    if (needsUpdate || order.TotalAmount != totalAmount)
                    {
                        // Get fresh order instance to avoid tracking conflicts
                        var orderToUpdate = await _repo.GetByIdAsync(order.OrderId);
                        if (orderToUpdate != null)
                        {
                            // Update OrderItem prices
                            foreach (var item in orderToUpdate.OrderItems)
                            {
                                if (item.Price <= 0)
                                {
                                    if (item.Medicine != null)
                                    {
                                        item.Price = item.Medicine.Price;
                                    }
                                    else
                                    {
                                        // Fallback: fetch medicine price directly
                                        var medicine = await _medicineRepo.GetByIdAsync(item.MedicineId);
                                        if (medicine != null)
                                        {
                                            item.Price = medicine.Price;
                                        }
                                    }
                                }
                            }
                            orderToUpdate.TotalAmount = totalAmount;
                            await _repo.UpdateAsync(orderToUpdate);
                        }
                    }
                }
            }
        }
    }
}