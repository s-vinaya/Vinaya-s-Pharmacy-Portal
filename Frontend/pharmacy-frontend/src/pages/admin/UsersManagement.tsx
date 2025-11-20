import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Pagination,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Visibility,
  CheckCircle,
  Cancel,

  Search,
  Block,
  HourglassEmpty,

  Edit,
  Delete,
} from "@mui/icons-material";
import { userService } from "../../services";
import type { UserAdmin, UserFormData, SnackbarState } from "../../types";

const UsersManagement = () => {
  const [userTab, setUserTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [pendingPharmacists, setPendingPharmacists] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'Customer',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const dataFetched = useRef(false);
  const refreshTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        // Filter pending pharmacists from the same data
        const pending = data.filter((u: UserAdmin) => u.status === 'PendingApproval' || u.status === 'Pending');
        setPendingPharmacists(pending);
      }
    } catch (error) {
      // Error fetching users
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUsers = () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }
    refreshTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 300);
  };



  const handleUserTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setUserTab(newValue);
  };

  const handleApprove = async (userId: number): Promise<void> => {
    try {
      const response = await userService.updateStatus(userId, { status: 0 });
      if (response.ok) {
        // Update local state instead of refetching
        setUsers(prev => prev.map(u => u.userId === userId ? {...u, status: 'Active'} : u));
        setPendingPharmacists(prev => prev.filter(u => u.userId !== userId));
        showSnackbar('User approved successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error approving user', 'error');
    }
  };

  const handleReject = async (userId: number): Promise<void> => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
      const response = await userService.updateStatus(userId, { status: 4, rejectionReason: reason });
      if (response.ok) {
        // Update local state instead of refetching
        setUsers(prev => prev.map(u => u.userId === userId ? {...u, status: 'Rejected'} : u));
        setPendingPharmacists(prev => prev.filter(u => u.userId !== userId));
        showSnackbar('User rejected successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error rejecting user', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info'): void => {
    setSnackbar({ open: true, message, severity });
  };



  const handleEditUser = (user: UserAdmin): void => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      firstName: user.name || '',
      lastName: '',
      email: user.email || '',
      phoneNumber: user.phone || '',
      password: '', // Not needed for edit
      role: user.role || 'Customer',
      status: user.status || 'Active'
    });
    setOpenDialog(true);
  };

  const handleViewUser = (user: UserAdmin): void => {
    setDialogMode('view');
    setSelectedUser(user);
    setFormData({
      firstName: user.name || '',
      lastName: '',
      email: user.email || '',
      phoneNumber: user.phone || '',
      password: '', // Not needed for view
      role: user.role || 'Customer',
      status: user.status || 'Active'
    });
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.delete(userId);
        if (response.ok) {
          // Update local state instead of refetching
          setUsers(prev => prev.filter(u => u.userId !== userId));
          setPendingPharmacists(prev => prev.filter(u => u.userId !== userId));
          showSnackbar('User deleted successfully', 'success');
        }
      } catch (error) {
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the form errors before submitting', 'error');
      return;
    }
    
    try {
      if (dialogMode === 'create') {
        // Create new user - map role to enum value
        const roleMap: Record<string, number> = {
          'Admin': 0,
          'Pharmacist': 1,
          'Customer': 2
        };
        
        const userData = {
          name: formData.firstName.trim(),
          email: formData.email,
          phone: formData.phoneNumber,
          password: formData.password,
          role: roleMap[formData.role].toString()
        };
        
        const response = await userService.create(userData);
        
        if (response.ok) {
          const responseData = await response.json();
          // Add new user to local state instead of refetching
          const newUser: UserAdmin = {
            userId: responseData.userId || Date.now(),
            name: formData.firstName.trim(),
            email: formData.email,
            phone: formData.phoneNumber,
            role: formData.role,
            status: formData.status,
            username: formData.email,
            createdAt: new Date().toISOString()
          };
          setUsers(prev => [...prev, newUser]);
          if (formData.status === 'PendingApproval' || formData.status === 'Pending') {
            setPendingPharmacists(prev => [...prev, newUser]);
          }
          setOpenDialog(false);
          showSnackbar('User created successfully', 'success');
        }
      } else {
        // Update existing user - separate profile and status updates
        const userData = {
          name: formData.firstName.trim(),
          email: formData.email,
          phone: formData.phoneNumber,
          role: formData.role
        };
        
        // Update profile
        const profileResponse = await userService.update(selectedUser!.userId, userData);
        
        // Update status separately if changed
        if (formData.status !== selectedUser!.status) {
          const statusMap: Record<string, number> = {
            'Active': 0,
            'Blocked': 1,
            'PendingApproval': 2,
            'Inactive': 3,
            'Rejected': 4
          };
          
          await userService.updateStatus(selectedUser!.userId, { status: statusMap[formData.status] });
        }
        
        if (profileResponse.ok) {
          debouncedFetchUsers();
          setOpenDialog(false);
          showSnackbar('User updated successfully', 'success');
        }
      }
    } catch (error) {
      showSnackbar('Error saving user', 'error');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits starting with 6, 7, 8, or 9';
    }
    
    if (dialogMode === 'create') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case "Active":
        return "success";
      case "Blocked":
        return "error";
      case "PendingApproval":
      case "Pending":
        return "warning";
      case "Inactive":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | null => {
    switch (status) {
      case "Active":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "Blocked":
        return <Block sx={{ fontSize: 16 }} />;
      case "PendingApproval":
      case "Pending":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "Inactive":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getCurrentUsers = () => {
    let currentUsers = [];
    switch (userTab) {
      case 0: // All Users
        currentUsers = users;
        break;
      case 1: // Customers
        currentUsers = users.filter(u => u.role === 'Customer');
        break;
      case 2: // Pharmacists
        currentUsers = users.filter(u => u.role === 'Pharmacist');
        break;
      case 3: // Pending Approvals
        currentUsers = pendingPharmacists;
        break;
      default:
        currentUsers = users;
    }
    return currentUsers;
  };

  const filteredUsers = getCurrentUsers().filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number): void => {
    setPage(newPage);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [userTab, searchTerm, roleFilter, statusFilter]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#023e8a', mb: 1 }}>
          👥 User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, roles, and permissions across the platform
        </Typography>
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* User Type Tabs */}
          <Tabs value={userTab} onChange={handleUserTabChange} sx={{ mb: 3 }}>
            <Tab label="All Users" />
            <Tab label="Customers" />
            <Tab label="Pharmacists" />
            <Tab label="Pending Approvals" />
          </Tabs>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "primary.main" }} />,
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Pharmacist">Pharmacist</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
                <MenuItem value="PendingApproval">Pending Approval</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

          </Box>

          {/* Users Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                    <TableRow key={user.userId || user.id} hover>
                      <TableCell>
                        {user.name || 
                         `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                         user.fullName || 
                         'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.phoneNumber || 
                         user.phone || 
                         user.contactNumber || 
                         'N/A'}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(user.status) || undefined}
                          label={user.status === 'PendingApproval' ? 'Pending Approval' : user.status}
                          color={getStatusColor(user.status)}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            '& .MuiChip-icon': {
                              fontSize: '16px'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleViewUser(user)}>
                          <Visibility />
                        </IconButton>
                        <IconButton color="warning" onClick={() => handleEditUser(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteUser(user.userId)}>
                          <Delete />
                        </IconButton>
                        {(user.status === "Pending" || user.status === "PendingApproval") && (
                          <>
                            <IconButton color="success" onClick={() => handleApprove(user.userId)}>
                              <CheckCircle />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleReject(user.userId)}>
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {filteredUsers.length === 0 ? 'No users found' : 'No users on this page'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min((page - 1) * rowsPerPage + 1, filteredUsers.length)}-{Math.min(page * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </Typography>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New User' : 
           dialogMode === 'edit' ? 'Edit User' : 'View User Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={dialogMode === 'view'}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={dialogMode === 'view'}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
            {dialogMode === 'create' && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'Min 8 chars with uppercase, lowercase, number and special character'}
                required
              />
            )}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    handleInputChange('phoneNumber', value);
                  }}
                  disabled={dialogMode === 'view'}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber || 'Must be 10 digits starting with 6, 7, 8, or 9'}
                  inputProps={{ maxLength: 10 }}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <FormControl fullWidth disabled={dialogMode === 'view'}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Pharmacist">Pharmacist</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <FormControl fullWidth disabled={dialogMode === 'view'}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
                <MenuItem value="PendingApproval">Pending Approval</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            {selectedUser?.role === 'Pharmacist' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Pharmacist Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        label="License Number"
                        value={selectedUser?.licenseNumber || 'N/A'}
                        disabled
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        value={selectedUser?.yearsOfExperience || 'N/A'}
                        disabled
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        label="Qualification"
                        value={selectedUser?.qualification || 'N/A'}
                        disabled
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TextField
                        fullWidth
                        label="State of License"
                        value={selectedUser?.stateOfLicense || 'N/A'}
                        disabled
                      />
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    label="License Expiry Date"
                    value={selectedUser?.licenseExpiryDate ? new Date(selectedUser.licenseExpiryDate).toLocaleDateString() : 'N/A'}
                    disabled
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveUser} variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersManagement;