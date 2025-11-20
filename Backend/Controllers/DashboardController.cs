using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMedicineService _medicineService;
        private readonly IOrderService _orderService;
        private readonly IPrescriptionService _prescriptionService;

        public DashboardController(
            IUserService userService,
            IMedicineService medicineService,
            IOrderService orderService,
            IPrescriptionService prescriptionService)
        {
            _userService = userService;
            _medicineService = medicineService;
            _orderService = orderService;
            _prescriptionService = prescriptionService;
        }

        [HttpGet("admin-summary")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetAdminDashboardSummary()
        {
            try
            {
                var usersCount = (await _userService.GetAllAsync()).Count();
                var medicinesCount = (await _medicineService.GetAllAsync()).Count();
                var ordersCount = (await _orderService.GetAllAsync()).Count();
                var prescriptionsCount = (await _prescriptionService.GetAllAsync()).Count();

                var recentActivity = await GetRecentActivityData();
                var systemAlerts = await GetSystemAlertsData();

                var summary = new
                {
                    usersCount,
                    medicinesCount,
                    ordersCount,
                    prescriptionsCount,
                    recentActivity,
                    systemAlerts
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pharmacist-summary")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<ActionResult<object>> GetPharmacistDashboardSummary()
        {
            try
            {
                var orders = await _orderService.GetAllAsync();
                var prescriptions = await _prescriptionService.GetAllAsync();
                var medicines = await _medicineService.GetAllAsync();

                var summary = new
                {
                    ordersCount = orders.Count(),
                    activeOrdersCount = orders.Count(o => o.Status.ToString() == "Pending" || o.Status.ToString() == "Processing"),
                    prescriptionsCount = prescriptions.Count(),
                    medicinesCount = medicines.Count(),
                    recentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(10).Select(o => new
                    {
                        orderId = o.OrderId,
                        totalAmount = o.TotalAmount,
                        status = o.Status.ToString(),
                        createdAt = o.CreatedAt,
                        userId = o.UserId
                    }),
                    recentPrescriptions = prescriptions.OrderByDescending(p => p.UploadedAt).Take(10).Select(p => new
                    {
                        prescriptionId = p.PrescriptionId,
                        userId = p.UserId,
                        status = p.Status.ToString(),
                        uploadedAt = p.UploadedAt
                    })
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("customer-summary")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<object>> GetCustomerDashboardSummary()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var user = await _userService.GetByIdAsync(userId);
                var orders = await _orderService.GetAllAsync();
                var prescriptions = await _prescriptionService.GetAllAsync();

                var userOrders = orders.Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt);
                var userPrescriptions = prescriptions.Where(p => p.UserId == userId);

                var summary = new
                {
                    myOrdersCount = userOrders.Count(),
                    myPrescriptionsCount = userPrescriptions.Count(),
                    userProfile = new
                    {
                        name = user?.Name ?? "Customer"
                    },
                    recentOrders = userOrders.Take(6).Select(o => new
                    {
                        orderId = o.OrderId,
                        totalAmount = o.TotalAmount,
                        status = o.Status.ToString(),
                        createdAt = o.CreatedAt,
                        orderItems = o.OrderItems?.Select(oi => new
                        {
                            medicineId = oi.MedicineId,
                            medicineName = oi.MedicineName,
                            quantity = oi.Quantity,
                            price = oi.Price
                        })
                    })
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent-activity")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentActivity()
        {
            try
            {
                var activities = await GetRecentActivityData();
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<List<object>> GetRecentActivityData()
        {
            var activities = new List<object>();

                // Get recent users (last 24 hours)
                var users = await _userService.GetAllAsync();
                var recentUsers = users.Where(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-1)).OrderByDescending(u => u.CreatedAt).Take(2);
                foreach (var user in recentUsers)
                {
                    activities.Add(new
                    {
                        action = $"New {user.Role.ToString().ToLower()} registered",
                        time = GetTimeAgo(user.CreatedAt),
                        type = "user",
                        timestamp = user.CreatedAt
                    });
                }

              
                var orders = await _orderService.GetAllAsync();
                var recentOrders = orders.Where(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-1)).OrderByDescending(o => o.CreatedAt).Take(2);
                foreach (var order in recentOrders)
                {
                    var action = order.Status.ToString() == "Delivered" ? "Order completed" : "New order received";
                    activities.Add(new
                    {
                        action = action,
                        time = GetTimeAgo(order.CreatedAt),
                        type = "order",
                        timestamp = order.CreatedAt
                    });
                }

               
                var prescriptions = await _prescriptionService.GetAllAsync();
                var recentPrescriptions = prescriptions.Where(p => p.UploadedAt >= DateTime.UtcNow.AddDays(-1)).OrderByDescending(p => p.UploadedAt).Take(2);
                foreach (var prescription in recentPrescriptions)
                {
                    var action = prescription.Status.ToString() == "Verified" ? "Prescription verified" : "New prescription uploaded";
                    activities.Add(new
                    {
                        action = action,
                        time = GetTimeAgo(prescription.UploadedAt),
                        type = "prescription",
                        timestamp = prescription.UploadedAt
                    });
                }

                // Sort by timestamp and take top 7 
                return activities.OrderByDescending(a => ((dynamic)a).timestamp).Take(7).ToList();
        }

        [HttpGet("system-alerts")]
        public async Task<ActionResult<object>> GetSystemAlerts()
        {
            try
            {
                var alerts = await GetSystemAlertsData();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<object> GetSystemAlertsData()
        {
            // Get low stock medicines
            var medicines = await _medicineService.GetAllAsync();
            var lowStockCount = medicines.Count(m => m.Stock <= 10);

            // Get pending prescriptions
            var prescriptions = await _prescriptionService.GetAllAsync();
            var pendingCount = prescriptions.Count(p => p.Status.ToString() == "Pending");

            var alerts = new
            {
                lowStockAlert = new
                {
                    title = " Low Stock Alert",
                    message = $"{lowStockCount} medicines are running low in inventory",
                    type = "warning",
                    count = lowStockCount
                },
                pendingReviews = new
                {
                    title = " Pending Reviews",
                    message = $"{pendingCount} prescriptions awaiting verification",
                    type = "info",
                    count = pendingCount
                },
                systemStatus = new
                {
                    title = " System Status",
                    message = "All systems operational - 99.9% uptime",
                    type = "success",
                    count = 0
                }
            };

            return alerts;
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;
            
            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} min ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hour{((int)timeSpan.TotalHours != 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} day{((int)timeSpan.TotalDays != 1 ? "s" : "")} ago";
            
            return dateTime.ToString("MMM dd, yyyy");
        }
    }
}