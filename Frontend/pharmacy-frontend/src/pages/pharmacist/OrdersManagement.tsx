import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { orderService, addressService } from '../../services';
import type { PharmacistOrder, PharmacistOrderItem } from '../../types';

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<PharmacistOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PharmacistOrder | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchOrders();
    }
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
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
            // Address fetch failed
          }
        }

        setSelectedOrder(order);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string): Promise<void> => {
    if (!selectedOrder) return;
    
    const availableStatuses = getAvailableStatuses(selectedOrder.status);
    if (!availableStatuses.includes(newStatus)) {
      setSnackbar({
        open: true,
        message: 'Invalid status transition. Please select a valid next status.',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await orderService.updateStatus(orderId, newStatus);
      if (response.ok) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        setOpenDialog(false);
        setSnackbar({
          open: true,
          message: `Order status updated from ${selectedOrder.status} to ${newStatus}`,
          severity: 'success'
        });
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Failed to update order status. Server responded with status ${response.status}`;
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'Network error occurred while updating order status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string): "warning" | "info" | "primary" | "success" | "error" | "default" => {
    switch (status) {
      case "Pending": return "warning";
      case "Processing": return "info";
      case "Shipped": return "primary";
      case "Delivered": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getAvailableStatuses = (currentStatus: string): string[] => {
    const statusFlow: Record<string, string[]> = {
      Pending: ["Processing", "Cancelled"],
      Processing: ["Shipped", "Cancelled"],
      Shipped: ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusDescription = (currentStatus: string): string => {
    const descriptions: Record<string, string> = {
      Pending: "Order received and awaiting processing",
      Processing: "Order is being prepared",
      Shipped: "Order has been shipped and is on the way",
      Delivered: "Order has been successfully delivered",
      Cancelled: "Order has been cancelled",
    };
    return descriptions[currentStatus] || "";
  };

  const filteredOrders = orders.filter((order: PharmacistOrder) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      order.orderId.toString().includes(searchTerm) ||
      order.userId.toString().includes(searchTerm) ||
      (order.prescriptionId && order.prescriptionId.toString().includes(searchTerm)) ||
      `ord-${order.orderId.toString().padStart(4, '0')}`.includes(searchLower) ||
      `cus-${order.userId.toString().padStart(4, '0')}`.includes(searchLower) ||
      (order.prescriptionId && `rx-${order.prescriptionId.toString().padStart(4, '0')}`.includes(searchLower));
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
          Orders Management
        </Typography>
      </Box>

      <Box sx={{ pl: 6, pr: 2 }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3, background: 'rgba(255,255,255,0.98)' }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <TextField
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 300, mr: 2 }}
              />
              <TextField
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
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
            ) : filteredOrders.length > 0 ? (
              <TableContainer sx={{ 
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <Table sx={{ 
                  '& .MuiTableHead-root': {
                    background: 'linear-gradient(135deg, #0077b6, #00b4d8)'
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', py: 2, textAlign: 'center' }}>Order ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Prescription ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Customer ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Items</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Total Amount</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Order Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order: PharmacistOrder, index: number) => (
                      <TableRow 
                        key={order.orderId}
                        sx={{
                          background: index % 2 === 0 
                            ? 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' 
                            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                            '& .MuiTableCell-root': {
                              borderBottom: '2px solid #0077b6'
                            }
                          },
                          cursor: 'pointer'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '0.95rem', py: 2, textAlign: 'center' }}>
                          ORD-{order.orderId.toString().padStart(4, '0')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: order.prescriptionId ? '#f57c00' : '#666', fontSize: '0.9rem', textAlign: 'center' }}>
                          {order.prescriptionId ? `RX-${order.prescriptionId.toString().padStart(4, '0')}` : 'NA'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: '600', color: '#424242', fontSize: '0.9rem', textAlign: 'center' }}>
                          CUS-{order.userId.toString().padStart(4, '0')}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#000', fontSize: '0.85rem' }}>
                            {order.orderItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#000', fontSize: '0.9rem' }}>
                            ₹{order.totalAmount?.toFixed(2) || "0.00"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={order.status} 
                            size="small" 
                            color={getStatusColor(order.status)} 
                            sx={{ fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography sx={{ color: '#000', fontSize: '0.85rem' }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit"
                            }) : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); handleViewOrder(order.orderId); }}
                            sx={{ 
                              background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                              color: 'white',
                              width: 36,
                              height: 36,
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #023e8a, #0077b6)'
                              },
                              boxShadow: '0 4px 12px rgba(0, 119, 182, 0.4)'
                            }}
                          >
                            <Visibility sx={{ fontSize: 18 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ 
                textAlign: "center", 
                py: 8, 
                background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                border: "2px dashed #cbd5e0"
              }}>
                <Typography variant="h5" sx={{ mb: 2, color: "#4a5568", fontWeight: "bold" }}>
                  📦 No orders found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Orders will appear here once customers place them
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details - ORD-{selectedOrder?.orderId.toString().padStart(4, '0')}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography variant="body1">ORD-{selectedOrder.orderId.toString().padStart(4, '0')}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Customer ID</Typography>
                    <Typography variant="body1">CUS-{selectedOrder.userId.toString().padStart(4, '0')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1">₹{selectedOrder.totalAmount?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Current Status</Typography>
                    <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} size="small" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                  </Box>
                  {selectedOrder.addressId && (
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="text.secondary">Address ID</Typography>
                      <Typography variant="body1">ADDR-{selectedOrder.addressId.toString().padStart(4, '0')}</Typography>
                    </Box>
                  )}
                </Box>
                {selectedOrder.prescriptionId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Prescription ID</Typography>
                    <Typography variant="body1">
                      RX-{selectedOrder.prescriptionId.toString().padStart(4, '0')}
                    </Typography>
                  </Box>
                )}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Order Items</Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.orderItems.map((item: PharmacistOrderItem, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.medicineName || `MED-${item.medicineId.toString().padStart(4, '0')}`}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₹{(item.price || 0).toFixed(2)}</TableCell>
                              <TableCell>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                <Box>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Delivery Address
                  </Typography>
                  {selectedOrder.address ? (
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedOrder.address.fullName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedOrder.address.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {selectedOrder.address.addressLine1}
                      </Typography>
                      {selectedOrder.address.addressLine2 && (
                        <Typography variant="body2">
                          <strong>Address Line 2:</strong> {selectedOrder.address.addressLine2}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>City:</strong> {selectedOrder.address.city}
                      </Typography>
                      <Typography variant="body2">
                        <strong>State:</strong> {selectedOrder.address.state}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Postal Code:</strong> {selectedOrder.address.postalCode}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 1 }}>
                      <Typography variant="body2" color="warning.main">
                        Address details not available {selectedOrder.addressId && `(Address ID: ADDR-${selectedOrder.addressId.toString().padStart(4, '0')})`}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current Status: <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} size="small" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {getStatusDescription(selectedOrder.status)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>Update Status</Typography>
                  {getAvailableStatuses(selectedOrder.status).length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {getAvailableStatuses(selectedOrder.status).map((status: string) => (
                        <Button
                          key={status}
                          variant="outlined"
                          size="small"
                          onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      This order status cannot be changed further.
                    </Typography>
                  )}
                  {getAvailableStatuses(selectedOrder.status).length > 0 && (
                    <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                      Available next statuses: {getAvailableStatuses(selectedOrder.status).join(", ")}
                    </Typography>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagement;