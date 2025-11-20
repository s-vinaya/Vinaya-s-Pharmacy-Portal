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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, Cancel } from "@mui/icons-material";
import { orderService } from '../../services';
import type { CustomerOrder, SnackbarState } from '../../types';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchMyOrders();
    }
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await orderService.getByUserId(parseInt(userId || '0'));
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        console.error('Authentication failed. Please log in again.');
      }
    } catch (error) {
      // Error fetching orders
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      const response = await orderService.getById(orderId);
      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
        setOpenDialog(true);
      }
    } catch (error) {
      // Error fetching order details
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await orderService.delete(orderId);
      if (response.ok) {
        setSnackbar({ open: true, message: 'Order cancelled successfully!', severity: 'success' });
        fetchMyOrders(); // Refresh the orders list
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Failed to cancel order', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error cancelling order', severity: 'error' });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#023e8a" }}>
            My Orders
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Track and manage your medicine orders
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="All">All Orders</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <>
          {orders.filter(order => statusFilter === 'All' || order.status === statusFilter).length > 0 ? (
            <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
          <Box sx={{ p: 3, background: 'rgba(255,255,255,0.98)' }}>
            <TableContainer sx={{
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <Table sx={{
                '& .MuiTableHead-root': {
                  background: 'linear-gradient(135deg, #667eea, #764ba2)'
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      py: 2
                    }}>Order ID</TableCell>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>Items</TableCell>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>Total Amount</TableCell>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>Status</TableCell>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>Order Date</TableCell>
                    <TableCell sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.filter(order => statusFilter === 'All' || order.status === statusFilter).map((order, index) => (
                    <TableRow
                      key={order.orderId}
                      sx={{
                        background: index % 2 === 0
                          ? 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                          '& .MuiTableCell-root': {
                            borderBottom: '2px solid #667eea'
                          }
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{
                        fontWeight: 'bold',
                        color: '#1976d2',
                        fontSize: '0.95rem',
                        py: 2
                      }}>
                        ORD-{order.orderId.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          fontWeight: 'bold',
                          color: '#6a1b9a',
                          fontSize: '0.85rem'
                        }}>
                          {order.orderItems?.length || 0}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          fontWeight: 'bold',
                          color: '#2e7d32',
                          fontSize: '0.9rem'
                        }}>
                          ₹{order.totalAmount?.toFixed(2) || "0.00"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status)}
                          sx={{
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{
                        color: '#666',
                        fontSize: '0.85rem'
                      }}>
                        <Box sx={{
                          px: 1.5,
                          py: 0.5,
                          background: 'linear-gradient(135deg, #fafafa, #f0f0f0)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          display: 'inline-block'
                        }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit"
                          }) : "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.orderId);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              color: 'white',
                              width: 36,
                              height: 36,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8, #6b46c1)'
                              },
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Visibility sx={{ fontSize: 16 }} />
                          </IconButton>
                          {(order.status === 'Pending' || order.status === 'Processing') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.orderId);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                                color: 'white',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #d32f2f, #c62828)'
                                },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                              }}
                            >
                              <Cancel sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
        </Box>
          ) : (
            <Box sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px dashed #dee2e6",
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {statusFilter === 'All' ? 'No orders found' : `No ${statusFilter.toLowerCase()} orders found`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusFilter === 'All' 
                  ? (localStorage.getItem('userToken') ? 'You haven\'t placed any orders yet' : 'Please log in to view your orders')
                  : `You don't have any ${statusFilter.toLowerCase()} orders`
                }
              </Typography>
            </Box>
          )}
        </>
      )}

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
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1">₹{selectedOrder.totalAmount?.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} size="small" />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
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
                          {selectedOrder.orderItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.medicineName || `MED-${item.medicineId.toString().padStart(4, '0')}`}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₹{item.price?.toFixed(2)}</TableCell>
                              <TableCell>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
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
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyOrders;