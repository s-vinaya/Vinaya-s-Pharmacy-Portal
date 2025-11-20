import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  TrendingUp,
  Assessment,
} from "@mui/icons-material";

const ReportsAnalytics = () => {
  const [reportTab, setReportTab] = useState<number>(0);
  const [dateRange, setDateRange] = useState<string>("Last 30 Days");

  const salesData = {
    dailySales: "₹12,450",
    growth: "+15%",
    totalRevenue: "₹3,45,600",
    totalOrders: 1245,
  };

  const topMedicines = [
    { name: "Paracetamol", sales: 245 },
    { name: "Amoxicillin", sales: 189 },
    { name: "Aspirin", sales: 156 },
    { name: "Vitamin D", sales: 134 },
    { name: "Ibuprofen", sales: 98 },
  ];

  const userAnalytics = {
    totalUsers: 1245,
    newUsers: 45,
    activeUsers: 892,
    pharmacists: 23,
  };

  const handleReportTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setReportTab(newValue);
  };



  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
        📊 Reports & Analytics
      </Typography>

      {/* Report Type Tabs */}
      <Tabs value={reportTab} onChange={handleReportTabChange} sx={{ mb: 3 }}>
        <Tab label="Sales Report" />
        <Tab label="User Analytics" />
        <Tab label="Inventory Report" />
        <Tab label="Custom Reports" />
      </Tabs>

      {/* Date Range Selector */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Date Range</InputLabel>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
            <MenuItem value="Last 3 Months">Last 3 Months</MenuItem>
            <MenuItem value="Last Year">Last Year</MenuItem>
          </Select>
        </FormControl>

      </Box>

      {/* Sales Overview */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
          Sales Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card sx={{ textAlign: "center", p: 2, backgroundColor: "#e3f2fd" }}>
              <CardContent>
                <TrendingUp sx={{ fontSize: 40, color: "#0077b6", mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
                  {salesData.dailySales}
                </Typography>
                <Typography variant="h6" sx={{ color: "#023e8a" }}>
                  Daily Sales
                </Typography>
                <Typography variant="body2" sx={{ color: "green", fontWeight: "bold" }}>
                  {salesData.growth}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px' }}>
            <Card sx={{ textAlign: "center", p: 2, backgroundColor: "#f3e5f5" }}>
              <CardContent>
                <Assessment sx={{ fontSize: 40, color: "#9c27b0", mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
                  {salesData.totalRevenue}
                </Typography>
                <Typography variant="h6" sx={{ color: "#023e8a" }}>
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px' }}>
            <Card sx={{ textAlign: "center", p: 2, backgroundColor: "#e8f5e8" }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
                  {salesData.totalOrders}
                </Typography>
                <Typography variant="h6" sx={{ color: "#023e8a" }}>
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px' }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}>
                  Top Medicines
                </Typography>
                <List dense>
                  {topMedicines.slice(0, 3).map((medicine, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`${index + 1}. ${medicine.name}`}
                        secondary={`${medicine.sales} sales`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Revenue Trend Chart Placeholder */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
          Revenue Trend
        </Typography>
        <Box
          sx={{
            height: 300,
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#666" }}>
            📈 Chart Visualization Area
          </Typography>
        </Box>
      </Paper>

      {/* User Analytics */}
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
          User Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0077b6" }}>
                  {userAnalytics.totalUsers}
                </Typography>
                <Typography variant="body1">Total Users</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4caf50" }}>
                  {userAnalytics.newUsers}
                </Typography>
                <Typography variant="body1">New Users</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ff9800" }}>
                  {userAnalytics.activeUsers}
                </Typography>
                <Typography variant="body1">Active Users</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#9c27b0" }}>
                  {userAnalytics.pharmacists}
                </Typography>
                <Typography variant="body1">Pharmacists</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsAnalytics;