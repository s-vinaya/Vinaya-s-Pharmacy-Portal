import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  LocalHospital,
  Assignment,
  Description,
  AccountCircle,
  ExitToApp,
  Dashboard,
  LocalPharmacy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { orderService, dashboardService } from '../../services';
import type { Order, OrderItem, Prescription, PharmacistDashboardData } from '../../types';

import OrdersManagement from "./OrdersManagement";
import PrescriptionsManagement from "./PrescriptionsManagement";
import MedicinesInventory from "./MedicinesInventory";

const PharmacistDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dashboardData, setDashboardData] = useState<PharmacistDashboardData>({
    ordersCount: 0,
    activeOrdersCount: 0,
    prescriptionsCount: 0,
    medicinesCount: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState<boolean>(true);
  const [selectedOrder] = useState<Order | null>(null);
  const [selectedPrescription] = useState<Prescription | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const dataFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchAllDashboardData();
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
    }
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      setOrdersLoading(true);
      setPrescriptionsLoading(true);
      
      const dashboardRes = await dashboardService.getPharmacistDashboardSummary();

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboardData({
          ordersCount: dashboardData.ordersCount || 0,
          activeOrdersCount: dashboardData.activeOrdersCount || 0,
          prescriptionsCount: dashboardData.prescriptionsCount || 0,
          medicinesCount: dashboardData.medicinesCount || 0
        });
        
        // Use recent orders from dashboard summary if available
        if (dashboardData.recentOrders) {
          setOrders(dashboardData.recentOrders.slice(0, 10));
        }
        setOrdersLoading(false);
        
        // Use recent prescriptions from dashboard summary if available
        if (dashboardData.recentPrescriptions) {
          setPrescriptions(dashboardData.recentPrescriptions.slice(0, 10));
        }
        setPrescriptionsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setOrdersLoading(false);
      setPrescriptionsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string): Promise<void> => {
    try {
      const response = await orderService.updateStatus(orderId, newStatus);
      if (response.ok) {
        fetchAllDashboardData();
        setOpenOrderDialog(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Removed unused functions to fix warnings

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

  const handleLogout = (): void => {
    localStorage.clear();
    navigate("/");
  };

  const dashboardStats = [
    { title: "Total Orders", count: dashboardData.ordersCount, change: "All time", icon: <Assignment />, color: "#2196F3" },
    { title: "Active Orders", count: dashboardData.activeOrdersCount, change: "Pending + Processing", icon: <LocalPharmacy />, color: "#FF9800" },
    { title: "Prescriptions", count: dashboardData.prescriptionsCount, change: "To review", icon: <Description />, color: "#9C27B0" },
    { title: "Medicines", count: dashboardData.medicinesCount, change: "In inventory", icon: <LocalHospital />, color: "#4CAF50" },
  ];

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <AppBar position="sticky" elevation={3} sx={{ background: "linear-gradient(135deg, #023e8a 0%, #0077b6 100%)" }}>
        <Toolbar>
          <LocalHospital sx={{ fontSize: 34, mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Vinaya's Pharmacy
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {[
            { label: "Dashboard", icon: <Dashboard /> },
            { label: "Orders", icon: <Assignment /> },
            { label: "Prescriptions", icon: <Description /> },
            { label: "Inventory", icon: <LocalPharmacy /> },
          ].map((tab, i) => (
            <Button
              key={i}
              startIcon={tab.icon}
              onClick={() => {
                setCurrentTab(i);
                setVisitedTabs(prev => new Set([...prev, i]));
              }}
              sx={{
                mx: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                color: currentTab === i ? "#ffffff" : "rgba(255,255,255,0.7)",
                backgroundColor: currentTab === i ? "rgba(255,255,255,0.2)" : "transparent",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              {tab.label}
            </Button>
          ))}
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            startIcon={<Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)" }}><AccountCircle /></Avatar>}
            sx={{ textTransform: "none", color: "white", fontWeight: 600 }}
          >
            Pharmacist
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1, color: "red" }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 0, py: { xs: 2, md: 4 } }}>
        {currentTab === 0 && (
          <>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#023e8a", textAlign: "center" }}>
              Pharmacist Dashboard
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 3, maxWidth: 1400 }}>
                {dashboardStats.map((stat, index) => (
                  <Box sx={{ flex: 1, minWidth: 0 }} key={index}>
                    <Card sx={{ p: 2, borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`, border: `1px solid ${stat.color}30` }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ background: stat.color, width: 50, height: 50, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: "700", color: "#1a237e" }}>{stat.count}</Typography>
                          <Typography variant="body2" sx={{ color: "#424242", fontWeight: "600", whiteSpace: "nowrap" }}>{stat.title}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 4, width: '100%', px: 3, position: 'relative' }}>
              {/* Background decoration */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%)',
                borderRadius: 4,
                zIndex: 0
              }} />
              <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a", textAlign: "center" }}>Recent Orders</Typography>
                <Card sx={{ 
                  height: 350, 
                  overflow: "hidden", 
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  border: "2px solid rgba(0, 119, 182, 0.3)",
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: "0 16px 50px rgba(0,0,0,0.2)"
                  }
                }}>
                  {ordersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <TableContainer sx={{ maxHeight: 300, overflowY: 'auto', overflowX: 'hidden' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: "linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)" }}>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Order ID</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.map((order: Order) => (
                            <TableRow key={order.orderId} sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 119, 182, 0.05)' },
                              '&:hover': { backgroundColor: 'rgba(0, 119, 182, 0.1)', transform: 'scale(1.01)' },
                              transition: 'all 0.2s ease'
                            }}>
                              <TableCell sx={{ fontWeight: "600", color: "#1565C0" }}>ORD-{order.orderId.toString().padStart(4, '0')}</TableCell>
                              <TableCell sx={{ fontWeight: "600", color: "#2E7D32" }}>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell>
                                <Chip label={order.status} color={getStatusColor(order.status)} size="small" sx={{ fontWeight: "bold" }} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Card>
              </Box>

              <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a", textAlign: "center" }}>Recent Prescriptions</Typography>
                <Card sx={{ 
                  height: 350, 
                  overflow: "hidden", 
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #fff8e1 0%, #f3e5f5 100%)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  border: "2px solid rgba(0, 119, 182, 0.3)",
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: "0 16px 50px rgba(0,0,0,0.2)"
                  }
                }}>
                  {prescriptionsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <TableContainer sx={{ maxHeight: 300, overflowY: 'auto', overflowX: 'hidden' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: "linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)" }}>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Patient</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescriptions.map((prescription: Prescription) => (
                            <TableRow key={prescription.prescriptionId} sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 119, 182, 0.05)' },
                              '&:hover': { backgroundColor: 'rgba(0, 119, 182, 0.1)', transform: 'scale(1.01)' },
                              transition: 'all 0.2s ease'
                            }}>
                              <TableCell sx={{ fontWeight: "600", color: "#1565C0" }}>RX-{prescription.prescriptionId.toString().padStart(4, '0')}</TableCell>
                              <TableCell sx={{ fontWeight: "600", color: "#2E7D32" }}>USR-{prescription.userId.toString().padStart(4, '0')}</TableCell>
                              <TableCell>
                                <Chip label={prescription.status} color={prescription.status === 'Approved' || prescription.status === 'Verified' ? 'success' : prescription.status === 'Rejected' ? 'error' : 'warning'} size="small" sx={{ fontWeight: "bold" }} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Card>
              </Box>
            </Box>
          </>
        )}

        {visitedTabs.has(1) && (
          <Box sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
            <OrdersManagement />
          </Box>
        )}
        {visitedTabs.has(2) && (
          <Box sx={{ display: currentTab === 2 ? 'block' : 'none' }}>
            <PrescriptionsManagement />
          </Box>
        )}
        {visitedTabs.has(3) && (
          <Box sx={{ display: currentTab === 3 ? 'block' : 'none' }}>
            <MedicinesInventory />
          </Box>
        )}
      </Box>

      {/* Order Details Dialog */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="md" fullWidth>
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
                    <Typography variant="body2" color="text.secondary">Current Status</Typography>
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
                          {selectedOrder.orderItems.map((item: OrderItem, index: number) => (
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
                <Box>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Update Status</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['Processing', 'Shipped', 'Delivered'].map((status: string) => (
                      <Button
                        key={status}
                        variant="outlined"
                        size="small"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, status)}
                        disabled={selectedOrder.status === status}
                      >
                        {status}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog open={openPrescriptionDialog} onClose={() => setOpenPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prescription Details - RX-{selectedPrescription?.prescriptionId.toString().padStart(4, '0')}</DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Prescription ID</Typography>
                  <Typography variant="body1">RX-{selectedPrescription.prescriptionId.toString().padStart(4, '0')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Patient ID</Typography>
                  <Typography variant="body1">USR-{selectedPrescription.userId.toString().padStart(4, '0')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Upload Date</Typography>
                  <Typography variant="body1">{new Date(selectedPrescription.uploadedAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedPrescription.status} 
                    color={selectedPrescription.status === 'Approved' || selectedPrescription.status === 'Verified' ? 'success' : selectedPrescription.status === 'Rejected' ? 'error' : 'warning'} 
                    size="small" 
                  />
                </Box>
                {selectedPrescription.filePath && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Prescription File</Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`https://localhost:7041${selectedPrescription.filePath}`, '_blank')}
                    >
                      View Prescription
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrescriptionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ bgcolor: "#023e8a", color: "white", py: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, px: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              PharmaCare Pharmacist
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Professional pharmacy management for healthcare providers.
            </Typography>
            <Typography variant="body2">
              Efficient • Accurate • Trusted
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Tools
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Order Processing</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Prescription Review</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Inventory Management</Typography>
            <Typography variant="body2">Patient Care</Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Support
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>📧 pharmacist@pharmacare.com</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>📞 +1 (555) 456-7890</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>🕒 24/7 Professional Support</Typography>
            <Typography variant="body2">📍 Healthcare Professional Portal</Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Resources
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Clinical Guidelines</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Drug Information</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Professional Training</Typography>
            <Typography variant="body2">Compliance Tools</Typography>
          </Box>
        </Box>
        
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", mt: 3, pt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Professional Guidelines | Drug Database | Clinical Resources | Training Materials
          </Typography>
          <Typography variant="body2">
            © 2025 PharmaCare Pharmacist Portal — All Rights Reserved | Professional Healthcare Solutions
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PharmacistDashboard;