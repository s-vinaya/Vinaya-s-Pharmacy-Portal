import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  LocalHospital,
  ShoppingCart,
  Description,
  AccountCircle,
  ExitToApp,
  Dashboard,
  LocalPharmacy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../contexts/CartContext';
import { dashboardService } from '../../services';
import type { Order, CustomerDashboardData } from '../../types';

import MedicinesCatalog from "./MedicinesCatalog";
import MyOrders from "./MyOrders";
import MyPrescriptions from "./MyPrescriptions";
import Profile from "./Profile";
import Cart from "./Cart";

const CustomerDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData>({
    myOrdersCount: 0,
    myPrescriptionsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const dataFetched = useRef(false);
  const navigate = useNavigate();
  const { getUniqueItemsCount } = useCart();

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchAllCustomerData();
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
    }
  }, []);

  const fetchAllCustomerData = async () => {
    try {
      setRecentOrdersLoading(true);
      const response = await dashboardService.getCustomerDashboardSummary();
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          myOrdersCount: data.myOrdersCount || 0,
          myPrescriptionsCount: data.myPrescriptionsCount || 0,
        });
        setRecentOrders(data.recentOrders || []);
        const name = data.customerName || localStorage.getItem('userName') || 'Customer';
        setCustomerName(name);
      } else {
        const fallbackName = localStorage.getItem('userName') || 'Customer';
        setCustomerName(fallbackName);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      const fallbackName = localStorage.getItem('userName') || 'Customer';
      setCustomerName(fallbackName);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  const refreshDashboardData = (skipNameUpdate = false) => {
    if (skipNameUpdate) {
      // Only refresh orders and counts, not the customer name
      fetchDashboardDataOnly();
    } else {
      fetchAllCustomerData();
    }
  };

  const fetchDashboardDataOnly = async () => {
    try {
      setRecentOrdersLoading(true);
      const response = await dashboardService.getCustomerDashboardSummary();
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          myOrdersCount: data.myOrdersCount || 0,
          myPrescriptionsCount: data.myPrescriptionsCount || 0,
        });
        setRecentOrders(data.recentOrders || []);
        // Don't update customer name here
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  const updateCustomerName = (name: string) => {
    setCustomerName(name);
  };

  const handleTabChange = (value: number) => {
    setCurrentTab(value);
  };
  const handleProfileClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const dashboardStats = [
    { title: "My Orders", count: dashboardData.myOrdersCount, change: "Total orders", icon: <ShoppingCart /> },
    { title: "Prescriptions", count: dashboardData.myPrescriptionsCount, change: "Uploaded", icon: <Description /> },
    { title: "Cart Items", count: getUniqueItemsCount(), change: "Ready to order", icon: <LocalPharmacy /> },
  ];

  const renderTabContent = () => {
    return (
      <>
        {currentTab === 1 && <MedicinesCatalog />}
        {currentTab === 2 && <MyOrders />}
        {currentTab === 3 && <MyPrescriptions onDataChange={refreshDashboardData} />}
        {currentTab === 4 && <Profile onDataChange={refreshDashboardData} onNameChange={updateCustomerName} />}
        {currentTab === 5 && <Cart onDataChange={refreshDashboardData} />}
      </>
    );
  };

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
            { label: "Medicines", icon: <LocalPharmacy /> },
            { label: "My Orders", icon: <ShoppingCart /> },
            { label: "Prescriptions", icon: <Description /> },
          ].map((tab, i) => (
            <Button
              key={i}
              startIcon={tab.icon}
              onClick={() => handleTabChange(i)}
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
          <IconButton color="inherit" onClick={() => setCurrentTab(5)}>
            <Badge badgeContent={getUniqueItemsCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <Button
            onClick={handleProfileClick}
            startIcon={<Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)" }}><AccountCircle /></Avatar>}
            sx={{ textTransform: "none", color: "white", fontWeight: 600 }}
          >
            {customerName?.split(' ')[0] || 'Customer'}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileClose}>
            <MenuItem onClick={() => {
              setCurrentTab(4);
              handleProfileClose();
            }}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1, color: "red" }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: '95%', mx: 'auto', width: '100%' }}>
        {currentTab === 0 && (
          <>
            <Box sx={{ display: 'flex', gap: 0, width: '100%', mb: 4 }}>
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#023e8a", textAlign: "left" }}>
                  Customer Dashboard
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  {dashboardStats.map((stat, index) => (
                    <Box key={index} sx={{ flex: '1 1 200px', maxWidth: '250px' }}>
                      <Card sx={{ p: 2, borderRadius: 2, textAlign: "center", height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ color: index === 0 ? '#4CAF50' : index === 1 ? '#FF9800' : '#2196F3', mb: 1 }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: "700", color: "#1a237e", mb: 0.5 }}>
                          {stat.count}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#424242", fontWeight: "600", fontSize: '0.85rem' }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666", fontSize: '0.75rem' }}>
                          {stat.change}
                        </Typography>
                      </Card>
                    </Box>
                  ))}
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                  Quick Actions
                </Typography>
                <Card sx={{ p: 3, height: 200, display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button variant="contained" fullWidth sx={{ py: 2, fontSize: '0.9rem' }} onClick={() => setCurrentTab(1)}>
                        Browse Medicines
                      </Button>
                      <Button variant="contained" fullWidth sx={{ py: 2, fontSize: '0.9rem' }} onClick={() => setCurrentTab(3)}>
                        Upload Prescription
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" fullWidth sx={{ py: 2, fontSize: '0.9rem' }} onClick={() => setCurrentTab(2)}>
                        View Orders
                      </Button>
                      <Button variant="outlined" fullWidth sx={{ py: 2, fontSize: '0.9rem' }} onClick={() => setCurrentTab(5)}>
                        View Cart
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Box>
              
              <Box sx={{ flex: 1, pl: 2 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                  Recent Orders
                </Typography>
                <Card sx={{ p: 3, height: 500, overflowY: "auto", display: 'flex', flexDirection: 'column' }}>
                  {recentOrdersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading recent orders...
                        </Typography>
                      </Box>
                    </Box>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <Box key={order.orderId} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 2, borderBottom: "1px solid #f0f0f0" }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.orderItems && order.orderItems.length > 0 
                              ? `${order.orderItems[0]?.medicineName || 'Medicine'} ${order.orderItems.length > 1 ? `+${order.orderItems.length - 1} more` : ''}` 
                              : `Order #${order.orderId}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            ₹{order.totalAmount?.toFixed(2) || '0.00'} • {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: order.status === 'Delivered' ? '#4CAF50' : order.status === 'Pending' ? '#FF9800' : '#2196F3', fontWeight: 600 }}>
                          {order.status}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent orders found
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Box>
            </Box>
          </>
        )}

        {renderTabContent()}
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#023e8a", color: "white", py: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, px: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              PharmaCare Customer
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Your trusted online pharmacy for all healthcare needs.
            </Typography>
            <Typography variant="body2">
              Safe • Fast • Reliable
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Services
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Medicine Catalog
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Prescription Upload
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Order Tracking
            </Typography>
            <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Health Consultation
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Support
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📧 support@pharmacare.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📞 +1 (555) 987-6543
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              🕒 24/7 Customer Support
            </Typography>
            <Typography variant="body2">
              💬 Live Chat Available
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Account
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              My Orders
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Prescriptions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Profile Settings
            </Typography>
            <Typography variant="body2">
              Order History
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", mt: 3, pt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Privacy Policy | Terms of Service | Refund Policy | FAQ | Contact Us
          </Typography>
          <Typography variant="body2">
            © 2025 PharmaCare Customer Portal — All Rights Reserved | Your Health, Our Priority
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

export default CustomerDashboard;