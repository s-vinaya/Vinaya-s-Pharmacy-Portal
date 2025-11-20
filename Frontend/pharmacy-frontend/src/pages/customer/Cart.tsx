import React, { useState } from "react";
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
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingCart, CloudUpload } from "@mui/icons-material";
import { useCart } from '../../contexts/CartContext';
import { orderService, prescriptionService, addressService } from '../../services';
import type { Address, AddressFormData, SnackbarState, CartItem } from '../../types';

interface CartProps {
  onDataChange?: () => void;
}

const Cart: React.FC<CartProps> = ({ onDataChange }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentType, setPaymentType] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const [prescriptionUploaded, setPrescriptionUploaded] = useState<boolean>(false);
  const [isCheckingPrescription, setIsCheckingPrescription] = useState<boolean>(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string}>({});

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for phone number
    if (field === 'phoneNumber' && value) {
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (value.length === 10 && !phoneRegex.test(value)) {
        setAddressErrors(prev => ({ ...prev, phoneNumber: 'Must start with 6, 7, 8, or 9' }));
      } else if (value.length > 0 && value.length < 10 && !/^[6-9][0-9]*$/.test(value)) {
        setAddressErrors(prev => ({ ...prev, phoneNumber: 'Must start with 6, 7, 8, or 9' }));
      }
    }
    
    // Real-time validation for postal code
    if (field === 'postalCode' && value) {
      const postalRegex = /^[0-9]{6}$/;
      if (value.length === 6 && !postalRegex.test(value)) {
        setAddressErrors(prev => ({ ...prev, postalCode: 'Must be 6 digits' }));
      } else if (value.length > 0 && !/^[0-9]*$/.test(value)) {
        setAddressErrors(prev => ({ ...prev, postalCode: 'Only numbers allowed' }));
      }
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await addressService.getByUserId(parseInt(userId || '0'));
      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.addressId);
          setUseNewAddress(false);
        } else if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].addressId);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      // Error fetching addresses
    }
  };

  const validateAddress = () => {
    // Full name validation
    if (!addressForm.fullName.trim()) {
      showSnackbar('Full name is required', 'error');
      return false;
    }
    if (addressForm.fullName.trim().length < 2) {
      showSnackbar('Full name must be at least 2 characters long', 'error');
      return false;
    }
    
    // Phone number validation
    if (!addressForm.phoneNumber.trim()) {
      showSnackbar('Phone number is required', 'error');
      return false;
    }
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(addressForm.phoneNumber.trim())) {
      showSnackbar('Phone number must be 10 digits starting with 6, 7, 8, or 9', 'error');
      return false;
    }
    
    // Address validation
    if (!addressForm.addressLine1.trim()) {
      showSnackbar('Address line 1 is required', 'error');
      return false;
    }
    if (addressForm.addressLine1.trim().length < 5) {
      showSnackbar('Address must be at least 5 characters long', 'error');
      return false;
    }
    
    // City validation
    if (!addressForm.city.trim()) {
      showSnackbar('City is required', 'error');
      return false;
    }
    if (addressForm.city.trim().length < 2) {
      showSnackbar('City name must be at least 2 characters long', 'error');
      return false;
    }
    
    // State validation
    if (!addressForm.state.trim()) {
      showSnackbar('State is required', 'error');
      return false;
    }
    if (addressForm.state.trim().length < 2) {
      showSnackbar('State name must be at least 2 characters long', 'error');
      return false;
    }
    
    // Postal code validation
    if (!addressForm.postalCode.trim()) {
      showSnackbar('Postal code is required', 'error');
      return false;
    }
    const postalRegex = /^[0-9]{6}$/;
    if (!postalRegex.test(addressForm.postalCode.trim())) {
      showSnackbar('Postal code must be exactly 6 digits', 'error');
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!paymentType) {
      showSnackbar('Please select a payment method', 'error');
      return;
    }

    // Check for out-of-stock items
    const outOfStockItems = cartItems.filter((item: CartItem) => item.stock === 0);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((item: CartItem) => item.name).join(', ');
      showSnackbar(`Cannot place order: ${itemNames} ${outOfStockItems.length === 1 ? 'is' : 'are'} out of stock`, 'error');
      return;
    }

    // Check if prescription is required
    if (hasPrescriptionRequiredMedicines && !prescriptionUploaded) {
      showSnackbar('Please upload a prescription before ordering prescription medicines', 'warning');
      setOpenPrescriptionDialog(true);
      return;
    }

    let addressId = selectedAddressId;

    if (useNewAddress) {
      if (!validateAddress()) {
        return;
      }

      try {
        const addressData = {
          userId: parseInt(localStorage.getItem('userId') || '0'),
          ...addressForm
        };
        
        const addressResponse = await addressService.create(addressData);
        
        if (!addressResponse.ok) {
          showSnackbar('Failed to save address!', 'error');
          return;
        }
        
        const createdAddress = await addressResponse.json();
        addressId = createdAddress.addressId;
      } catch (error) {
        showSnackbar('Error saving address!', 'error');
        return;
      }
    }

    if (!addressId) {
      showSnackbar('Please select an address!', 'error');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      let prescriptionId = null;

      // Upload prescription only when placing order
      if (selectedFile && hasPrescriptionRequiredMedicines) {
        const prescriptionResponse = await prescriptionService.upload(parseInt(userId || '0'), selectedFile);
        if (prescriptionResponse.ok) {
          const prescriptionData = await prescriptionResponse.json();
          prescriptionId = prescriptionData.prescriptionId;
        } else {
          showSnackbar('Failed to upload prescription', 'error');
          return;
        }
      }

      const orderData = {
        userId: parseInt(userId || '0'),
        addressId: addressId,
        prescriptionId: prescriptionId,
        orderItems: cartItems.map((item: CartItem) => ({
          medicineId: item.medicineId,
          quantity: item.quantity
        }))
      };

      const response = await orderService.create(orderData);

      if (response.ok) {
        setOpenPaymentDialog(false);
        setPaymentType('');
        setSelectedAddressId(null);
        setUseNewAddress(false);
        setSelectedFile(null);
        setPrescriptionUploaded(false);
        setAddressForm({
          fullName: '',
          phoneNumber: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: ''
        });
        setAddressErrors({});
        showSnackbar(`Order placed successfully via ${paymentType}! Your medicines will be delivered to the provided address.`, 'success');
        onDataChange?.();
        setTimeout(() => clearCart(), 2000);
      } else {
        showSnackbar('Failed to place order', 'error');
      }
    } catch (error) {
      showSnackbar('Error placing order', 'error');
    }
  };

  const handleUploadPrescription = () => {
    if (!selectedFile) {
      showSnackbar('Please select a file', 'error');
      return;
    }

    // Just mark prescription as uploaded (file is stored temporarily)
    setPrescriptionUploaded(true);
    showSnackbar('Prescription selected successfully. It will be uploaded when you place the order.', 'success');
    setOpenPrescriptionDialog(false);
  };

  const hasPrescriptionRequiredMedicines = cartItems.some((item: CartItem) => item.requiresPrescription);

  React.useEffect(() => {
    if (hasPrescriptionRequiredMedicines) {
      setIsCheckingPrescription(false);
    } else {
      setIsCheckingPrescription(false);
    }
  }, [hasPrescriptionRequiredMedicines, prescriptionUploaded]);



  if (cartItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add some medicines to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a" }}>
        Shopping Cart
      </Typography>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Medicine</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item: CartItem) => (
                <TableRow key={item.medicineId} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        {item.name}
                      </Typography>
                      {item.requiresPrescription && (
                        <Chip label="Prescription Required" color="warning" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: item.stock || 0, style: { textAlign: 'center', width: '60px' } }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 0)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => removeFromCart(item.medicineId)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Total: ₹{getCartTotal().toFixed(2)}
          </Typography>
          <Button variant="outlined" color="error" onClick={clearCart}>
            Clear Cart
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {hasPrescriptionRequiredMedicines && (
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => setOpenPrescriptionDialog(true)}
              sx={{ mb: 2 }}
            >
              Upload Prescription
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={async () => {
              if (hasPrescriptionRequiredMedicines && !prescriptionUploaded) {
                setOpenPrescriptionDialog(true);
              } else {
                await fetchSavedAddresses();
                setOpenPaymentDialog(true);
              }
            }}
            disabled={isCheckingPrescription}
            sx={{ px: 4 }}
          >
            {isCheckingPrescription ? 'Checking...' : (hasPrescriptionRequiredMedicines && !prescriptionUploaded ? 'Upload Prescription First' : 'Place Order')}
          </Button>

        </Box>
      </Card>

      {/* Order Confirmation Dialog */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)}>
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to place this order?
          </Typography>
          <Typography variant="h6">
            Total Amount: ₹{getCartTotal().toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Items: {cartItems.length} | Quantity: {cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            setOpenOrderDialog(false);
            setOpenPaymentDialog(true);
          }} variant="contained">Continue to Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Upload Dialog */}
      <Dialog open={openPrescriptionDialog} onClose={() => setOpenPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Some items in your cart require a prescription. Please select a clear image or PDF. The prescription will be uploaded when you place your order.
            </Typography>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Check file extension first
                  const fileName = file.name.toLowerCase();
                  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
                  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
                  
                  if (!hasValidExtension) {
                    showSnackbar('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed for prescriptions.', 'error');
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                  }
                  
                  // Check MIME type
                  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                  if (!allowedTypes.includes(file.type)) {
                    showSnackbar('Invalid file type detected. Please select a valid prescription document (PDF, JPG, JPEG, PNG only).', 'error');
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                  }
                  
                  // Check file size
                  if (file.size > 5 * 1024 * 1024) {
                    showSnackbar('File size must be less than 5MB', 'error');
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                  }
                  
                  // Block video files explicitly
                  if (file.type.startsWith('video/')) {
                    showSnackbar('Video files are not allowed for prescription uploads. Please upload an image or PDF document.', 'error');
                    e.target.value = '';
                    setSelectedFile(null);
                    return;
                  }
                  
                  setSelectedFile(file);
                } else {
                  setSelectedFile(null);
                }
              }}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrescriptionDialog(false)}>Cancel</Button>
          <Button onClick={handleUploadPrescription} variant="contained">
            Select Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Selection Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Complete Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Delivery Address</Typography>
            
            {savedAddresses.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Saved Address:</Typography>
                {savedAddresses.map((address: Address) => (
                  <Card 
                    key={address.addressId} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      cursor: 'pointer',
                      border: selectedAddressId === address.addressId ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}
                    onClick={() => {
                      setSelectedAddressId(address.addressId);
                      setUseNewAddress(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {address.fullName} {address.isDefault && <Chip label="Default" size="small" color="primary" />}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.addressLine1}, {address.city}, {address.state} {address.postalCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
                
                <Button 
                  variant="outlined" 
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  sx={{ mt: 1 }}
                >
                  {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
                </Button>
              </Box>
            )}
            
            {(useNewAddress || savedAddresses.length === 0) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={addressForm.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      error={!!addressErrors.fullName}
                      helperText={addressErrors.fullName}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
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
                      required
                    />
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={addressForm.addressLine1}
                  onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                  error={!!addressErrors.addressLine1}
                  helperText={addressErrors.addressLine1}
                  required
                />
                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  value={addressForm.addressLine2}
                  onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      error={!!addressErrors.city}
                      helperText={addressErrors.city}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      error={!!addressErrors.state}
                      helperText={addressErrors.state}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
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
                      required
                    />
                  </Box>
                </Box>
              </Box>
            )}
            
            <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                <MenuItem value="UPI">UPI Payment</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Order Summary</Typography>
              <Typography variant="body2"><strong>Total Items:</strong> {cartItems.length}</Typography>
              <Typography variant="body2"><strong>Total Quantity:</strong> {cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}</Typography>
              <Typography variant="body2"><strong>Total Amount:</strong> ₹{getCartTotal().toFixed(2)}</Typography>
              {selectedFile && prescriptionUploaded && (
                <Typography variant="body2" color="success.main">
                  <strong>Prescription:</strong> ✓ {selectedFile.name} (will be uploaded with order)
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePlaceOrder} variant="contained">
            Place Order
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Cart;