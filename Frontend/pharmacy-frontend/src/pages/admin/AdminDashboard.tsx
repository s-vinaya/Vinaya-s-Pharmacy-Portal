import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  Avatar,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  LocalHospital,
  People,
  LocalPharmacy,
  Assignment,
  Description,
  AccountCircle,
  ExitToApp,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {  dashboardService } from '../../services';
import type { AdminDashboardData, RecentActivity, SystemAlerts } from '../../types';

import UsersManagement from "./UsersManagement";
import MedicinesManagement from "./MedicinesManagement";
import OrdersManagement from "./OrdersManagement";
import PrescriptionsManagement from "./PrescriptionsManagement";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    usersCount: 0,
    medicinesCount: 0,
    ordersCount: 0,
    prescriptionsCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlerts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
      setLoading(true);
      const response = await dashboardService.getAdminDashboardSummary();
      
      if (response.ok) {
        const data = await response.json();
        
        setDashboardData({
          usersCount: data.usersCount || 0,
          medicinesCount: data.medicinesCount || 0,
          ordersCount: data.ordersCount || 0,
          prescriptionsCount: data.prescriptionsCount || 0
        });
        setRecentActivity(data.recentActivity || []);
        setSystemAlerts(data.systemAlerts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: number): void => {
    setCurrentTab(value);
    setVisitedTabs(prev => new Set([...prev, value]));
  };
  const handleProfileClick = (e: React.MouseEvent<HTMLElement>): void => setAnchorEl(e.currentTarget);
  const handleProfileClose = (): void => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userToken");
    navigate("/");
  };

  const dashboardStats = [
    { title: "Users", count: dashboardData.usersCount, change: "Total Users", icon: <People /> },
    { title: "Medicines", count: dashboardData.medicinesCount, change: "In inventory", icon: <LocalPharmacy /> },
    { title: "Orders", count: dashboardData.ordersCount, change: "Total Orders", icon: <Assignment /> },
    { title: "Prescriptions", count: dashboardData.prescriptionsCount, change: "Total Prescriptions", icon: <Description /> },
  ];

  

  const quickActions = [
    { title: "Approve Pharmacist", action: () => setCurrentTab(1) },
    { title: "Add Users", action: () => setCurrentTab(1) },
    { title: "Add Medicine", action: () => setCurrentTab(2) },
    { title: "View Prescriptions", action: () => setCurrentTab(4) },
  ];

  const renderTabContent = () => {
    return (
      <>
        {visitedTabs.has(1) && (
          <Box sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
            <UsersManagement />
          </Box>
        )}
        {visitedTabs.has(2) && (
          <Box sx={{ display: currentTab === 2 ? 'block' : 'none' }}>
            <MedicinesManagement />
          </Box>
        )}
        {visitedTabs.has(3) && (
          <Box sx={{ display: currentTab === 3 ? 'block' : 'none' }}>
            <OrdersManagement />
          </Box>
        )}
        {visitedTabs.has(4) && (
          <Box sx={{ display: currentTab === 4 ? 'block' : 'none' }}>
            <PrescriptionsManagement />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={3}
        sx={{
          background: "linear-gradient(135deg, #023e8a 0%, #0077b6 100%)",
          boxShadow: 5,
        }}
      >
        <Toolbar>
          <LocalHospital sx={{ fontSize: 34, mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Vinaya's Pharmacy 
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Navigation Tabs in Header */}
          {[
            { label: "Dashboard", icon: <Dashboard /> },
            { label: "Users", icon: <People /> },
            { label: "Medicines", icon: <LocalPharmacy /> },
            { label: "Orders", icon: <Assignment /> },
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
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              {tab.label}
            </Button>
          ))}
          <Button
            onClick={handleProfileClick}
            startIcon={
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)" }}>
                <AccountCircle />
              </Avatar>
            }
            sx={{
              textTransform: "none",
              color: "white",
              fontWeight: 600,
            }}
          >
            Admin
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: { borderRadius: 2, mt: 1, boxShadow: 4, minWidth: 180 },
            }}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1, color: "red" }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>



      {/* Main Content */}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {currentTab === 0 && (
          <>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: "#023e8a",
                textAlign: "center",
              }}
            >
              Admin Dashboard Overview
            </Typography>

            {/* Dashboard Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {dashboardStats.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
                      border: "1px solid rgba(0,119,182,0.1)",
                      boxShadow: "0 4px 20px rgba(0,119,182,0.08)",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: "4px",
                        background: `linear-gradient(180deg, ${index === 0 ? '#4CAF50' : index === 1 ? '#FF9800' : index === 2 ? '#2196F3' : '#9C27B0'}, ${index === 0 ? '#81C784' : index === 1 ? '#FFB74D' : index === 2 ? '#64B5F6' : '#BA68C8'})`,
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(0,119,182,0.15)",
                        "& .icon-container": {
                          transform: "scale(1.1)",
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        className="icon-container"
                        sx={{
                          background: `linear-gradient(135deg, ${index === 0 ? '#4CAF50' : index === 1 ? '#FF9800' : index === 2 ? '#2196F3' : '#9C27B0'}, ${index === 0 ? '#81C784' : index === 1 ? '#FFB74D' : index === 2 ? '#64B5F6' : '#BA68C8'})`,
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 24,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          className="count-text"
                          variant="h5" 
                          sx={{ 
                            fontWeight: "700", 
                            color: "#1a237e",
                            mb: 0.2,
                            lineHeight: 1.2,
                          }}
                        >
                          {stat.count}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#424242", fontWeight: "600", mb: 0.2, fontSize: '0.85rem' }}>
                          {stat.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "#666",
                            opacity: 0.8,
                            fontSize: '0.7rem',
                            display: "block",
                          }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Two Column Layout */}
            <Grid container spacing={3}>
              {/* Left Column - Quick Actions */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                  Quick Actions
                </Typography>
                <Card sx={{ p: 2, height: 180, display: "flex", alignItems: "center" }}>
                  <Grid container spacing={2} sx={{ width: "100%" }}>
                    {quickActions.map((action, index) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={index}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={action.action}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #0077b6, #00b4d8)",
                            fontWeight: "600",
                            "&:hover": {
                              background: "linear-gradient(90deg, #005f8a, #0096c7)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          {action.title}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Grid>

              {/* Right Column - Recent Activity */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                  Recent Activity
                </Typography>
                <Card sx={{ p: 2, height: 180, overflowY: "scroll" }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </Box>
                  ) : recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1.5, pb: 1.5, borderBottom: index < recentActivity.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: activity.type === "user" ? "#4CAF50" : activity.type === "prescription" ? "#9C27B0" : activity.type === "medicine" ? "#FF9800" : "#2196F3", mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.action}</Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>{activity.time}</Typography>
                      </Box>
                    </Box>
                  )) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>

            {/* System Alerts */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                System Alerts
              </Typography>
              <Grid container spacing={2}>
                {systemAlerts && (
                  <>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ p: 2, border: "1px solid #FF9800", bgcolor: "#FFF3E0" }}>
                        <Typography variant="subtitle2" sx={{ color: "#E65100", fontWeight: "bold", mb: 1 }}>{systemAlerts.lowStockAlert.title}</Typography>
                        <Typography variant="body2" sx={{ color: "#BF360C" }}>{systemAlerts.lowStockAlert.message}</Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ p: 2, border: "1px solid #2196F3", bgcolor: "#E3F2FD" }}>
                        <Typography variant="subtitle2" sx={{ color: "#0D47A1", fontWeight: "bold", mb: 1 }}>{systemAlerts.pendingReviews.title}</Typography>
                        <Typography variant="body2" sx={{ color: "#1565C0" }}>{systemAlerts.pendingReviews.message}</Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ p: 2, border: "1px solid #4CAF50", bgcolor: "#E8F5E8" }}>
                        <Typography variant="subtitle2" sx={{ color: "#2E7D32", fontWeight: "bold", mb: 1 }}>{systemAlerts.systemStatus.title}</Typography>
                        <Typography variant="body2" sx={{ color: "#388E3C" }}>{systemAlerts.systemStatus.message}</Typography>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </>
        )}

        {renderTabContent()}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#023e8a",
          color: "white",
          py: 4,
          mt: 4,
        }}
      >
        <Grid container spacing={4} sx={{ px: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              PharmaCare Admin
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Comprehensive pharmacy management system for healthcare professionals.
            </Typography>
            <Typography variant="body2">
              Secure • Reliable • Efficient
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Quick Links
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              User Management
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Medicine Inventory
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Order Processing
            </Typography>
            <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              Prescription Verification
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Support
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📧 admin@pharmacare.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📞 +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              🕒 24/7 Technical Support
            </Typography>
            <Typography variant="body2">
              📍 Healthcare District, Medical Plaza
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              System Info
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Version: 2.1.0
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Last Updated: Jan 2025
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Status:  All Systems Operational
            </Typography>
            <Typography variant="body2">
              Uptime: 99.9%
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", mt: 3, pt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Privacy Policy | Terms of Service | Security | API Documentation | Help Center
          </Typography>
          <Typography variant="body2">
            © 2025 PharmaCare Admin Portal — All Rights Reserved | Powered by React & .NET Core
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

export default AdminDashboard;
