import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

} from "@mui/material";
import { Search, Add, Remove } from "@mui/icons-material";
import { useCart } from '../../contexts/CartContext';
import { medicineService, prescriptionService, addressService, orderService } from '../../services';
import type { Medicine, Address, AddressFormData, SnackbarState } from '../../types';

// Global cache to prevent multiple API calls
let medicinesCache: Medicine[] | null = null;
let medicinesFetching = false;

const MedicinesCatalog: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(medicinesCache || []);
  const [loading, setLoading] = useState<boolean>(!medicinesCache);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState<boolean>(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState<boolean>(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<string>('');
  const [buyNowMedicine, setBuyNowMedicine] = useState<Medicine | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState<boolean>(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const { addToCart } = useCart();

  useEffect(() => {
    if (!medicinesCache && !medicinesFetching) {
      fetchMedicines();
    }
  }, []);

  const fetchMedicines = async () => {
    if (medicinesFetching) return;
    
    try {
      medicinesFetching = true;
      setLoading(true);
      const response = await medicineService.getAll();
      if (response.ok) {
        const data = await response.json();
        medicinesCache = data;
        setMedicines(data);
      }
    } catch (error) {
      // Error fetching medicines
    } finally {
      setLoading(false);
      medicinesFetching = false;
    }
  };

  const handleAddressChange = (field: keyof AddressFormData, value: string) => {
    setAddressForm((prev: AddressFormData) => ({ ...prev, [field]: value }));
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || medicine.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(medicines.map(m => m.categoryName).filter(Boolean))];

  const getQuantity = (medicineId: number): number => quantities[medicineId] || 1;
  
  const updateQuantity = (medicineId: number, newQuantity: number) => {
    setQuantities(prev => ({ ...prev, [medicineId]: newQuantity }));
  };



  const handleAddToCart = (medicine: Medicine) => {
    addToCart(medicine);
    setSnackbar({ open: true, message: `${medicine.name} added to cart!`, severity: 'success' });
  };

  const handleBuyNow = async (medicine: Medicine) => {
    setBuyNowMedicine(medicine);
    await fetchSavedAddresses();
    if (medicine.requiresPrescription) {
      setOpenPrescriptionDialog(true);
    } else {
      setOpenPaymentDialog(true);
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

  const handlePrescriptionUpload = async () => {
    if (!prescriptionFile) {
      setSnackbar({ open: true, message: 'Please upload a prescription!', severity: 'error' });
      return;
    }

    // Just proceed to payment dialog without uploading prescription yet
    setOpenPrescriptionDialog(false);
    setOpenPaymentDialog(true);
  };

  const validateAddress = () => {
    if (!addressForm.fullName.trim()) {
      setSnackbar({ open: true, message: 'Full name is required', severity: 'error' });
      return false;
    }
    if (addressForm.fullName.trim().length < 2) {
      setSnackbar({ open: true, message: 'Full name must be at least 2 characters long', severity: 'error' });
      return false;
    }
    
    if (!addressForm.phoneNumber.trim()) {
      setSnackbar({ open: true, message: 'Phone number is required', severity: 'error' });
      return false;
    }
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(addressForm.phoneNumber.trim())) {
      setSnackbar({ open: true, message: 'Phone number must be 10 digits starting with 6, 7, 8, or 9', severity: 'error' });
      return false;
    }
    
    if (!addressForm.addressLine1.trim()) {
      setSnackbar({ open: true, message: 'Address line 1 is required', severity: 'error' });
      return false;
    }
    if (addressForm.addressLine1.trim().length < 5) {
      setSnackbar({ open: true, message: 'Address must be at least 5 characters long', severity: 'error' });
      return false;
    }
    
    if (!addressForm.city.trim()) {
      setSnackbar({ open: true, message: 'City is required', severity: 'error' });
      return false;
    }
    if (addressForm.city.trim().length < 2) {
      setSnackbar({ open: true, message: 'City name must be at least 2 characters long', severity: 'error' });
      return false;
    }
    
    if (!addressForm.state.trim()) {
      setSnackbar({ open: true, message: 'State is required', severity: 'error' });
      return false;
    }
    if (addressForm.state.trim().length < 2) {
      setSnackbar({ open: true, message: 'State name must be at least 2 characters long', severity: 'error' });
      return false;
    }
    
    if (!addressForm.postalCode.trim()) {
      setSnackbar({ open: true, message: 'Postal code is required', severity: 'error' });
      return false;
    }
    const postalRegex = /^[0-9]{6}$/;
    if (!postalRegex.test(addressForm.postalCode.trim())) {
      setSnackbar({ open: true, message: 'Postal code must be exactly 6 digits', severity: 'error' });
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!paymentType) {
      setSnackbar({ open: true, message: 'Please select a payment method!', severity: 'error' });
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
          setSnackbar({ open: true, message: 'Failed to save address!', severity: 'error' });
          return;
        }
        
        const createdAddress = await addressResponse.json();
        addressId = createdAddress.addressId;
      } catch (error) {
        setSnackbar({ open: true, message: 'Error saving address!', severity: 'error' });
        return;
      }
    }

    if (!addressId) {
      setSnackbar({ open: true, message: 'Please select an address!', severity: 'error' });
      return;
    }

    // Upload prescription only when placing order (if prescription file exists)
    let finalPrescriptionId = prescriptionId;
    if (prescriptionFile && !prescriptionId) {
      try {
        const userId = localStorage.getItem('userId');
        const prescriptionResponse = await prescriptionService.upload(parseInt(userId || '0'), prescriptionFile);
        
        if (prescriptionResponse.ok) {
          const uploadedPrescription = await prescriptionResponse.json();
          finalPrescriptionId = uploadedPrescription.prescriptionId;
        } else {
          setSnackbar({ open: true, message: 'Failed to upload prescription. Please try again.', severity: 'error' });
          return;
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error uploading prescription. Please try again.', severity: 'error' });
        return;
      }
    }

    try {
      const orderData = {
        userId: parseInt(localStorage.getItem('userId') || '0'),
        addressId: addressId,
        prescriptionId: finalPrescriptionId,
        orderItems: [{
          medicineId: buyNowMedicine!.medicineId,
          quantity: getQuantity(buyNowMedicine!.medicineId)
        }]
      };

      const response = await orderService.create(orderData);

      if (response.ok) {
        const prescriptionText = prescriptionFile ? ' with prescription' : '';
        setSnackbar({ open: true, message: `Order placed for ${buyNowMedicine!.name}${prescriptionText} via ${paymentType}!`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to place order. Please try again.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error placing order. Please try again.', severity: 'error' });
    }
    
    setOpenPaymentDialog(false);
    setPrescriptionFile(null);
    setPrescriptionId(null);
    setPaymentType('');
    setSelectedAddressId(null);
    setUseNewAddress(false);
    setAddressForm({
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: ''
    });
    setBuyNowMedicine(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
          Medicine Catalog
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            sx={{ minWidth: 250 }}
            size="small"
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
              Loading medicines...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
          {filteredMedicines.map((medicine) => (
          <Box key={medicine.medicineId}>
            <Box sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card 
                onClick={() => {
                  setSelectedMedicine(medicine);
                  setOpenDialog(true);
                }}
                sx={{ 
                  height: 200, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  '&:hover': { boxShadow: 3, borderColor: '#1976d2' },
                  mb: 1,
                  cursor: 'pointer'
                }}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: '#fafafa'
                }}>
                  {medicine.imageUrl ? (
                    <img 
                      src={medicine.imageUrl} 
                      alt={medicine.name} 
                      style={{ 
                        maxWidth: '90%', 
                        maxHeight: '90%', 
                        objectFit: 'contain'
                      }} 
                    />
                  ) : (
                    <Box sx={{ color: '#ccc', textAlign: 'center' }}>
                      <Typography variant="caption">No Image</Typography>
                    </Box>
                  )}
                </Box>
              </Card>
              
              <Box sx={{ px: 0.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    mb: 0.5,
                    color: '#000',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {medicine.name}
                </Typography>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#000', 
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}
                >
                  {medicine.categoryName || 'General'}
                </Typography>
                
                {/* Quantity Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666', 
                      fontSize: '0.8rem'
                    }}
                  >
                    Unit: ₹{medicine.price?.toFixed(2)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => updateQuantity(medicine.medicineId, Math.max(1, getQuantity(medicine.medicineId) - 1))}
                      sx={{ width: 20, height: 20, bgcolor: '#f5f5f5' }}
                    >
                      <Remove sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 16, textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#000' }}>
                      {getQuantity(medicine.medicineId)}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => updateQuantity(medicine.medicineId, Math.min(medicine.stock, getQuantity(medicine.medicineId) + 1))}
                      disabled={getQuantity(medicine.medicineId) >= medicine.stock}
                      sx={{ width: 20, height: 20, bgcolor: '#f5f5f5' }}
                    >
                      <Add sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#2e7d32', 
                    fontWeight: 700,
                    fontSize: '1rem',
                    mb: 0.5
                  }}
                >
                  Total: ₹{(medicine.price * getQuantity(medicine.medicineId)).toFixed(2)}
                </Typography>
                
                <Chip 
                  label={medicine.stock > 0 ? 'Available' : 'Out of Stock'} 
                  size="small"
                  sx={{
                    bgcolor: medicine.stock > 0 ? '#e8f5e8' : '#ffebee',
                    color: medicine.stock > 0 ? '#2e7d32' : '#d32f2f',
                    fontSize: '0.7rem',
                    height: 20,
                    mb: 1
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddToCart(medicine)}
                    sx={{ 
                      flex: 1,
                      borderColor: '#10847e',
                      color: '#10847e',
                      '&:hover': { borderColor: '#0d6b66', bgcolor: '#f0f8f7' },
                      fontSize: '0.75rem',
                      py: 0.6,
                      textTransform: 'none'
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBuyNow(medicine)}
                    disabled={medicine.stock === 0}
                    sx={{ 
                      flex: 1,
                      bgcolor: '#10847e',
                      '&:hover': { bgcolor: '#0d6b66' },
                      fontSize: '0.75rem',
                      py: 0.6,
                      textTransform: 'none'
                    }}
                  >
                    Buy Now
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Medicine Details</DialogTitle>
        <DialogContent>
          {selectedMedicine && (
            <Box>
              {selectedMedicine.imageUrl && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img src={selectedMedicine.imageUrl} alt={selectedMedicine.name} style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                </Box>
              )}
              <Typography variant="h6" sx={{ mb: 1 }}>{selectedMedicine.name}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedMedicine.description}</Typography>
              <Typography variant="body2"><strong>Price:</strong> ₹{selectedMedicine.price?.toFixed(2)}</Typography>
              <Typography variant="body2"><strong>Stock:</strong> {selectedMedicine.stock}</Typography>
              <Typography variant="body2"><strong>Category:</strong> {selectedMedicine.categoryName || 'Unknown'}</Typography>
              <Typography variant="body2"><strong>Requires Prescription:</strong> {selectedMedicine.requiresPrescription ? 'Yes' : 'No'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedMedicine && (
            <Button 
              onClick={() => {
                handleAddToCart(selectedMedicine);
                setOpenDialog(false);
              }}
              variant="contained"
            >
              Add to Cart
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Prescription Upload Dialog */}
      <Dialog open={openPrescriptionDialog} onClose={() => setOpenPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prescription Required</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              This medicine requires a prescription. Please upload your prescription to proceed with the order.
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              Upload Prescription
              <input 
                type="file" 
                hidden 
                accept=".pdf,.jpg,.jpeg,.png" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Check file extension first
                    const fileName = file.name.toLowerCase();
                    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
                    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
                    
                    if (!hasValidExtension) {
                      setSnackbar({ open: true, message: 'Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed for prescriptions.', severity: 'error' });
                      e.target.value = '';
                      setPrescriptionFile(null);
                      return;
                    }
                    
                    // Check MIME type
                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(file.type)) {
                      setSnackbar({ open: true, message: 'Invalid file type detected. Please select a valid prescription document (PDF, JPG, JPEG, PNG only).', severity: 'error' });
                      e.target.value = '';
                      setPrescriptionFile(null);
                      return;
                    }
                    
                    // Check file size
                    if (file.size > 5 * 1024 * 1024) {
                      setSnackbar({ open: true, message: 'File size must be less than 5MB', severity: 'error' });
                      e.target.value = '';
                      setPrescriptionFile(null);
                      return;
                    }
                    
                    // Block video files explicitly
                    if (file.type.startsWith('video/')) {
                      setSnackbar({ open: true, message: 'Video files are not allowed for prescription uploads. Please upload an image or PDF document.', severity: 'error' });
                      e.target.value = '';
                      setPrescriptionFile(null);
                      return;
                    }
                    
                    setPrescriptionFile(file);
                  } else {
                    setPrescriptionFile(null);
                  }
                }}
              />
            </Button>
            {prescriptionFile && (
              <Typography variant="body2" color="success.main">
                ✓ {prescriptionFile.name} uploaded
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrescriptionDialog(false)}>Cancel</Button>
          <Button onClick={handlePrescriptionUpload} variant="contained">
            Continue to Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Selection Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Delivery Address</Typography>
            
            {savedAddresses.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Saved Address:</Typography>
                {savedAddresses.map((address) => (
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
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={addressForm.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    required
                    sx={{ flex: '1 1 300px' }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={addressForm.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      handleAddressChange('phoneNumber', value);
                    }}
                    helperText="Must start with 6, 7, 8, or 9"
                    inputProps={{ maxLength: 10 }}
                    required
                    sx={{ flex: '1 1 300px' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={addressForm.addressLine1}
                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                    required
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Address Line 2 (Optional)"
                    value={addressForm.addressLine2}
                    onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={addressForm.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    required
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={addressForm.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    required
                    sx={{ flex: '1 1 200px' }}
                  />
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={addressForm.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      handleAddressChange('postalCode', value);
                    }}
                    helperText="6-digit postal code"
                    inputProps={{ maxLength: 6 }}
                    required
                    sx={{ flex: '1 1 200px' }}
                  />
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
            {buyNowMedicine && (
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Order Summary</Typography>
                <Typography variant="body2"><strong>Medicine:</strong> {buyNowMedicine.name}</Typography>
                <Typography variant="body2"><strong>Quantity:</strong> {getQuantity(buyNowMedicine.medicineId)}</Typography>
                <Typography variant="body2"><strong>Unit Price:</strong> ₹{buyNowMedicine.price?.toFixed(2)}</Typography>
                <Typography variant="body2"><strong>Total Amount:</strong> ₹{(buyNowMedicine.price * getQuantity(buyNowMedicine.medicineId)).toFixed(2)}</Typography>
                {prescriptionFile && (
                  <Typography variant="body2" color="success.main">
                    <strong>Prescription:</strong> ✓ {prescriptionFile.name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePlaceOrder} 
            variant="contained"
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>

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

export default MedicinesCatalog;
