import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Visibility, Search, Delete } from "@mui/icons-material";
import { orderService, addressService } from '../../services';
import type { Order } from '../../types';

const OrdersManagement = () => {
  const [orderTab, setOrderTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [processingOrders, setProcessingOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll();
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        
        // Filter orders by status from the same data
        const pending = data.filter((order: Order) => order.status === 'Pending');
        const processing = data.filter((order: Order) => order.status === 'Processing');
        const delivered = data.filter((order: Order) => order.status === 'Delivered');
        const cancelled = data.filter((order: Order) => order.status === 'Cancelled');
        
        setPendingOrders(pending);
        setProcessingOrders(processing);
        setDeliveredOrders(delivered);
        setCancelledOrders(cancelled);
      }
    } catch (error) {
      // Error fetching orders
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByStatus = async () => {
    // This function is no longer needed as we filter from existing orders data
    // But keeping it for compatibility with existing calls
    const pending = orders.filter((order: Order) => order.status === 'Pending');
    const processing = orders.filter((order: Order) => order.status === 'Processing');
    const delivered = orders.filter((order: Order) => order.status === 'Delivered');
    const cancelled = orders.filter((order: Order) => order.status === 'Cancelled');
    
    setPendingOrders(pending);
    setProcessingOrders(processing);
    setDeliveredOrders(delivered);
    setCancelledOrders(cancelled);
  };



  const handleViewOrder = async (orderId: number): Promise<void> => {
    try {
      const response = await orderService.getById(orderId);
      if (response.ok) {
        const order = await response.json();

        if (order.addressId) {
          try {
            const addressResponse = await addressService.getById(order.addressId);
            if (addressResponse.ok) {
              const address = await addressResponse.json();
              order.address = address;
            }
          } catch (error) {
            // Error fetching address
          }
        }

        setSelectedOrder(order);
        setOpenDialog(true);
      }
    } catch (error) {
      // Error fetching order details
    }
  };



  const handleDeleteOrder = async (orderId: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await orderService.delete(orderId);
        if (response.ok) {
          fetchOrders();
          fetchOrdersByStatus();
        }
      } catch (error) {
        // Error deleting order
      }
    }
  };

  const handleOrderTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setOrderTab(newValue);
  };

  const getStatusColor = (
    status?: string
  ): "warning" | "info" | "primary" | "success" | "error" | "default" => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Processing":
        return "info";
      case "Shipped":
        return "primary";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };



  const getCurrentOrders = () => {
    switch (orderTab) {
      case 0:
        return orders;
      case 1:
        return pendingOrders;
      case 2:
        return processingOrders;
      case 3:
        return deliveredOrders;
      case 4:
        return cancelledOrders;
      default:
        return orders;
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box sx={{ ml: 6 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            Order Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer orders, track status, and process deliveries
          </Typography>
        </Box>

        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { 
            xs: "repeat(2, 1fr)", 
            sm: "repeat(3, 1fr)", 
            md: "repeat(5, 1fr)" 
          },
          gap: 1.5, 
          maxWidth: 850 
        }}>
          <Card
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              boxShadow: 2,
              height: 80,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#4caf50", mb: 0.5 }}
            >
              {orders.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Total Orders
            </Typography>
          </Card>
          <Card
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: "#fff3e0",
              borderRadius: 2,
              boxShadow: 2,
              height: 80,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#ff9800", mb: 0.5 }}
            >
              {pendingOrders.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Pending
            </Typography>
          </Card>
          <Card
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              boxShadow: 2,
              height: 80,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#2196f3", mb: 0.5 }}
            >
              {processingOrders.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Processing
            </Typography>
          </Card>
          <Card
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: "#f3e5f5",
              borderRadius: 2,
              boxShadow: 2,
              height: 80,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#9c27b0", mb: 0.5 }}
            >
              {orders.filter(o => o.status === 'Shipped').length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Shipped
            </Typography>
          </Card>
          <Card
            sx={{
              p: 1.5,
              textAlign: "center",
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              boxShadow: 2,
              height: 80,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#4caf50", mb: 0.5 }}
            >
              {deliveredOrders.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Delivered
            </Typography>
          </Card>
        </Box>
      </Box>

      <Box sx={{ pl: 6, pr: 2 }}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ p: 3, background: "rgba(255,255,255,0.98)" }}>
            <Tabs
              value={orderTab}
              onChange={handleOrderTabChange}
              sx={{ mb: 3 }}
            >
              <Tab label="All Orders" />
              <Tab label="Pending" />
              <Tab label="Processing" />
              <Tab label="Delivered" />
              <Tab label="Cancelled" />
            </Tabs>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "primary.main" }} />
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    border: '4px solid #e3f2fd',
                    borderTop: '4px solid #1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    mx: 'auto',
                    mb: 2,
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                  <Typography variant="body1" color="text.secondary">
                    Loading orders...
                  </Typography>
                </Box>
              </Box>
            ) : getCurrentOrders().filter((order) => {
                const matchesSearch =
                  order.orderId?.toString().includes(searchTerm) ||
                  order.userId?.toString().includes(searchTerm);
                return matchesSearch;
              }).length > 0 ? (
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ p: 3, background: "rgba(255,255,255,0.98)" }}>
                  <TableContainer
                    sx={{
                      overflow: "auto",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                      maxHeight: { xs: "70vh", md: "none" }
                    }}
                  >
                    <Table
                      sx={{
                        minWidth: 800,
                        "& .MuiTableHead-root": {
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              py: 2,
                              textAlign: "center"
                            }}
                          >
                            Order ID
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Prescription ID
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Customer ID
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Items
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Total Amount
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Status
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Order Date
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              textAlign: "center"
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentOrders()
                          .filter((order) => {
                            const searchLower = searchTerm.toLowerCase();
                            const matchesSearch = searchTerm === "" ||
                              order.orderId?.toString().includes(searchTerm) ||
                              order.userId?.toString().includes(searchTerm) ||
                              (order.prescriptionId && order.prescriptionId.toString().includes(searchTerm)) ||
                              `ord-${order.orderId?.toString().padStart(4, '0')}`.includes(searchLower) ||
                              `cus-${order.userId?.toString().padStart(4, '0')}`.includes(searchLower) ||
                              (order.prescriptionId && `rx-${order.prescriptionId.toString().padStart(4, '0')}`.includes(searchLower));
                            return matchesSearch;
                          })
                          .map((order, index) => (
                            <TableRow
                              key={order.orderId}
                              sx={{
                                background:
                                  index % 2 === 0
                                    ? "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)"
                                    : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)",
                                  "& .MuiTableCell-root": {
                                    borderBottom: "2px solid #667eea",
                                  },
                                },
                                cursor: "pointer",
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: "bold",
                                  color: "#1976d2",
                                  fontSize: "0.95rem",
                                  py: 2,
                                  textAlign: "center"
                                }}
                              >
                                ORD-{order.orderId.toString().padStart(4, "0")}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: "bold",
                                  color: order.prescriptionId ? "#f57c00" : "#666",
                                  fontSize: "0.9rem",
                                  textAlign: "center"
                                }}
                              >
                                {order.prescriptionId ? `RX-${order.prescriptionId.toString().padStart(4, "0")}` : "NA"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: "600",
                                  color: "#424242",
                                  fontSize: "0.9rem",
                                  textAlign: "center"
                                }}
                              >
                                CUS-{order.userId.toString().padStart(4, "0")}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {order.orderItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  ₹{order.totalAmount?.toFixed(2) || "0.00"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Chip
                                  label={order.status}
                                  size="small"
                                  color={getStatusColor(order.status)}
                                  sx={{
                                    fontWeight: "bold",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ textAlign: "center" }}>
                                <Typography
                                  sx={{
                                    color: "#000",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {order.createdAt
                                    ? new Date(
                                        order.createdAt
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "2-digit",
                                      })
                                    : "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewOrder(order.orderId);
                                    }}
                                    sx={{
                                      background:
                                        "linear-gradient(135deg, #667eea, #764ba2)",
                                      color: "white",
                                      width: 36,
                                      height: 36,
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg, #5a67d8, #6b46c1)",
                                      },
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <Visibility sx={{ fontSize: 16 }} />
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteOrder(order.orderId);
                                    }}
                                    sx={{
                                      background:
                                        "linear-gradient(135deg, #f44336, #d32f2f)",
                                      color: "white",
                                      width: 36,
                                      height: 36,
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg, #d32f2f, #c62828)",
                                      },
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  border: "2px dashed #dee2e6",
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {loading ? "Loading..." : "No orders found"}
                </Typography>
                {!loading && (
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Orders will appear here once created by customers"}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Order Details - ORD-{selectedOrder?.orderId
            .toString()
            .padStart(4, "0")}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Order ID
                      </Typography>
                      <Typography variant="body1">
                        ORD-{selectedOrder.orderId.toString().padStart(4, "0")}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        User ID
                      </Typography>
                      <Typography variant="body1">
                        CUS-{selectedOrder.userId.toString().padStart(4, "0")}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Address ID
                      </Typography>
                      <Typography variant="body1">
                        ADDR-
                        {(selectedOrder.addressId || 0)
                          .toString()
                          .padStart(4, "0")}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="body1">
                        ₹{selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedOrder.status}
                        color={getStatusColor(selectedOrder.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ flex: "1 1 300px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  {selectedOrder.prescriptionId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Prescription ID
                      </Typography>
                      <Typography variant="body1">
                        RX-
                        {selectedOrder.prescriptionId
                          .toString()
                          .padStart(4, "0")}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Order Items
                    </Typography>
                    {selectedOrder.orderItems &&
                    selectedOrder.orderItems.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item ID</TableCell>
                              <TableCell>Medicine</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrder.orderItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  ITEM-
                                  {(item.orderItemId || 0)
                                    .toString()
                                    .padStart(4, "0")}
                                </TableCell>
                                <TableCell>
                                  {item.medicineName ||
                                    `MED-${item.medicineId
                                      .toString()
                                      .padStart(4, "0")}`}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  ₹{item.price?.toFixed(2) || "0.00"}
                                </TableCell>
                                <TableCell>
                                  ₹
                                  {(
                                    (item.price || 0) * (item.quantity || 0)
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items found
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Delivery Address
                    </Typography>
                    {selectedOrder.address ? (
                      <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>Name:</strong>{" "}
                          {selectedOrder.address.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {selectedOrder.address.phoneNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong>{" "}
                          {selectedOrder.address.addressLine1}
                        </Typography>
                        {selectedOrder.address.addressLine2 && (
                          <Typography variant="body2">
                            <strong>Address Line 2:</strong>{" "}
                            {selectedOrder.address.addressLine2}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>City:</strong> {selectedOrder.address.city}
                        </Typography>
                        <Typography variant="body2">
                          <strong>State:</strong> {selectedOrder.address.state}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Postal Code:</strong>{" "}
                          {selectedOrder.address.postalCode}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 1 }}>
                        <Typography variant="body2" color="warning.main">
                          Address details not available (Address ID: ADDR-
                          {(selectedOrder.addressId || 0)
                            .toString()
                            .padStart(4, "0")}
                          )
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default OrdersManagement;