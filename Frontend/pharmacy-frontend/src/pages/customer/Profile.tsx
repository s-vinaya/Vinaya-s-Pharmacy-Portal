import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import { Save, Add, Edit, Delete, Person, Email, Phone, Home, LocationCity } from "@mui/icons-material";
import { userService, addressService } from '../../services';
import type { ProfileData, Address, SnackbarState } from '../../types';

interface ProfileProps {
  onDataChange?: (skipNameUpdate?: boolean) => void;
  onNameChange?: (name: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onDataChange, onNameChange }) => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [openAddressDialog, setOpenAddressDialog] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string}>({});
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchProfile();
      fetchAddresses();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await userService.getProfile(parseInt(userId || '0'));
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      // Error fetching profile
    }
  };

  const fetchAddresses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await addressService.getByUserId(parseInt(userId || '0'));
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      // Error fetching addresses
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await userService.updateProfile(parseInt(userId || '0'), profile);

      if (response.ok) {
        showSnackbar('Profile updated successfully', 'success');
        onNameChange?.(profile.name); // Update customer name immediately
        onDataChange?.(true); // Refresh dashboard data but skip name update
      } else {
        showSnackbar('Failed to update profile', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating profile', 'error');
    }
  };

  const handleAddressChange = (field: keyof Address, value: string | boolean) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (typeof value === 'string' && addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for phone number
    if (field === 'phoneNumber' && typeof value === 'string' && value) {
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (value.length === 10 && !phoneRegex.test(value)) {
        setAddressErrors(prev => ({ ...prev, phoneNumber: 'Must start with 6, 7, 8, or 9' }));
      } else if (value.length > 0 && value.length < 10 && !/^[6-9][0-9]*$/.test(value)) {
        setAddressErrors(prev => ({ ...prev, phoneNumber: 'Must start with 6, 7, 8, or 9' }));
      }
    }
    
    // Real-time validation for postal code
    if (field === 'postalCode' && typeof value === 'string' && value) {
      const postalRegex = /^[0-9]{6}$/;
      if (value.length === 6 && !postalRegex.test(value)) {
        setAddressErrors(prev => ({ ...prev, postalCode: 'Must be 6 digits' }));
      } else if (value.length > 0 && !/^[0-9]*$/.test(value)) {
        setAddressErrors(prev => ({ ...prev, postalCode: 'Only numbers allowed' }));
      }
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: profile.name,
      phoneNumber: profile.phone,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: addresses.length === 0
    });
    setOpenAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setOpenAddressDialog(true);
  };

  const validateAddress = () => {
    if (!addressForm.fullName?.trim()) {
      showSnackbar('Full name is required', 'error');
      return false;
    }
    if ((addressForm.fullName?.trim().length || 0) < 2) {
      showSnackbar('Full name must be at least 2 characters long', 'error');
      return false;
    }
    
    if (!addressForm.phoneNumber?.trim()) {
      showSnackbar('Phone number is required', 'error');
      return false;
    }
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(addressForm.phoneNumber?.trim() || '')) {
      showSnackbar('Phone number must be 10 digits starting with 6, 7, 8, or 9', 'error');
      return false;
    }
    
    if (!addressForm.addressLine1?.trim()) {
      showSnackbar('Address line 1 is required', 'error');
      return false;
    }
    if ((addressForm.addressLine1?.trim().length || 0) < 5) {
      showSnackbar('Address must be at least 5 characters long', 'error');
      return false;
    }
    
    if (!addressForm.city?.trim()) {
      showSnackbar('City is required', 'error');
      return false;
    }
    if ((addressForm.city?.trim().length || 0) < 2) {
      showSnackbar('City name must be at least 2 characters long', 'error');
      return false;
    }
    
    if (!addressForm.state?.trim()) {
      showSnackbar('State is required', 'error');
      return false;
    }
    if ((addressForm.state?.trim().length || 0) < 2) {
      showSnackbar('State name must be at least 2 characters long', 'error');
      return false;
    }
    
    if (!addressForm.postalCode?.trim()) {
      showSnackbar('Postal code is required', 'error');
      return false;
    }
    const postalRegex = /^[0-9]{6}$/;
    if (!postalRegex.test(addressForm.postalCode?.trim() || '')) {
      showSnackbar('Postal code must be exactly 6 digits', 'error');
      return false;
    }
    
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) {
      return;
    }

    try {
      const userId = parseInt(localStorage.getItem('userId') || '0');
      const addressData = { ...addressForm, userId };

      if (editingAddress) {
        await addressService.update(editingAddress.addressId!, addressData);
        // Update local state instead of refetching
        setAddresses(prev => prev.map(addr => 
          addr.addressId === editingAddress.addressId ? { 
            ...addressData, 
            addressId: editingAddress.addressId,
            addressLine1: addressData.addressLine1 || '',
            city: addressData.city || '',
            state: addressData.state || ''
          } as Address : addr
        ));
        showSnackbar('Address updated successfully', 'success');
      } else {
        const response = await addressService.create(addressData);
        const newAddress = await response.json();
        // Add to local state instead of refetching
        setAddresses(prev => [...prev, newAddress]);
        showSnackbar('Address added successfully', 'success');
      }
      
      setOpenAddressDialog(false);
      setAddressErrors({});
    } catch (error) {
      showSnackbar('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await addressService.delete(addressId);
      // Update local state instead of refetching
      setAddresses(prev => prev.filter(addr => addr.addressId !== addressId));
      showSnackbar('Address deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Error deleting address', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
        {profile.name ? `${profile.name}'s Profile` : 'My Profile'}
      </Typography>

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px' }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: "#0077b6" }} />,
                  }}
                  size="small"
                />
              </Box>
              <Box sx={{ flex: '1 1 250px' }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: "#0077b6" }} />,
                  }}
                  disabled
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ maxWidth: 300 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  handleInputChange('phone', value);
                }}
                error={profile.phone.length > 0 && (profile.phone.length !== 10 || !/^[6-9]/.test(profile.phone))}
                helperText={profile.phone.length > 0 && (profile.phone.length !== 10 || !/^[6-9]/.test(profile.phone)) ? "Must be 10 digits starting with 6, 7, 8, or 9" : ""}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                size="small"
              />
            </Box>

            <Box>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveProfile}
                size="small"
                sx={{ mt: 1 }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Addresses Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Saved Addresses</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={handleAddAddress}>
              Add Address
            </Button>
          </Box>
          
          {addresses.length === 0 ? (
            <Typography color="text.secondary">No addresses saved yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {addresses.map((address) => (
                <Box key={address.addressId} sx={{ flex: '1 1 400px' }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {address.fullName}
                      </Typography>
                      <Box>
                        {address.isDefault && <Chip label="Default" size="small" color="primary" sx={{ mr: 1 }} />}
                        <IconButton size="small" onClick={() => handleEditAddress(address)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteAddress(address.addressId!)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.city}, {address.state} {address.postalCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {address.phoneNumber}
                    </Typography>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Address Dialog */}
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={addressForm.fullName}
                onChange={(e) => handleAddressChange('fullName', e.target.value)}
                error={!!addressErrors.fullName}
                helperText={addressErrors.fullName}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={addressForm.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  handleAddressChange('phoneNumber', value);
                }}
                error={!!addressErrors.phoneNumber}
                helperText={addressErrors.phoneNumber || 'Must start with 6, 7, 8, or 9'}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Address Line 1"
              value={addressForm.addressLine1}
              onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
              error={!!addressErrors.addressLine1}
              helperText={addressErrors.addressLine1}
              InputProps={{
                startAdornment: <Home sx={{ mr: 1, color: "#0077b6" }} />,
              }}
              required
            />
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              value={addressForm.addressLine2}
              onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              InputProps={{
                startAdornment: <Home sx={{ mr: 1, color: "#0077b6" }} />,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={addressForm.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                error={!!addressErrors.city}
                helperText={addressErrors.city}
                InputProps={{
                  startAdornment: <LocationCity sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="State"
                value={addressForm.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                error={!!addressErrors.state}
                helperText={addressErrors.state}
                InputProps={{
                  startAdornment: <LocationCity sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Postal Code"
                value={addressForm.postalCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  handleAddressChange('postalCode', value);
                }}
                error={!!addressErrors.postalCode}
                helperText={addressErrors.postalCode || '6-digit postal code'}
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: <LocationCity sx={{ mr: 1, color: "#0077b6" }} />,
                }}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAddress} variant="contained">
            {editingAddress ? 'Update' : 'Add'} Address
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;