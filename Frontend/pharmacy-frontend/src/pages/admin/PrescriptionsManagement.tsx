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
  Search,
  Delete,
} from "@mui/icons-material";
import { prescriptionService } from '../../services';
import type { PrescriptionAdmin, SnackbarState } from '../../types';

const PrescriptionsManagement = () => {
  const [prescriptionTab, setPrescriptionTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [prescriptions, setPrescriptions] = useState<PrescriptionAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PrescriptionAdmin[]>([]);
  const [verifiedPrescriptions, setVerifiedPrescriptions] = useState<PrescriptionAdmin[]>([]);
  const [rejectedPrescriptions, setRejectedPrescriptions] = useState<PrescriptionAdmin[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionAdmin | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchPrescriptions();
    }
  }, []);

  const fetchPrescriptions = async (): Promise<void> => {
    try {
      const response = await prescriptionService.getAll();
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
        
        // Filter prescriptions by status from the same data
        const pending = data.filter((prescription: PrescriptionAdmin) => prescription.status === 'Pending');
        const verified = data.filter((prescription: PrescriptionAdmin) => prescription.status === 'Verified' || prescription.status === 'Approved');
        const rejected = data.filter((prescription: PrescriptionAdmin) => prescription.status === 'Rejected');
        
        setPendingPrescriptions(pending);
        setVerifiedPrescriptions(verified);
        setRejectedPrescriptions(rejected);
      }
    } catch (error) {
      // Error fetching prescriptions
    } finally {
      setLoading(false);
    }
  };



  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info'): void => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePrescriptionTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setPrescriptionTab(newValue);
  };

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Verified":
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };



  const handleViewPrescription = async (prescriptionId: number): Promise<void> => {
    try {
      // Use existing prescriptions data instead of making another API call
      const prescription = prescriptions.find((p: PrescriptionAdmin) => p.prescriptionId === prescriptionId);
      if (prescription) {
        setSelectedPrescription(prescription);
        setOpenDialog(true);
      } else {
        showSnackbar('Prescription not found', 'error');
      }
    } catch (error) {
      showSnackbar('Error fetching prescription details', 'error');
    }
  };

  const handleDeletePrescription = async (prescriptionId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const response = await prescriptionService.delete(prescriptionId);
        if (response.ok) {
          fetchPrescriptions();
          showSnackbar('Prescription deleted successfully', 'success');
        } else {
          showSnackbar('Failed to delete prescription', 'error');
        }
      } catch (error) {
        showSnackbar('Error deleting prescription', 'error');
      }
    }
  };

  const getCurrentPrescriptions = () => {
    switch (prescriptionTab) {
      case 0: return prescriptions;
      case 1: return pendingPrescriptions;
      case 2: return verifiedPrescriptions;
      case 3: return rejectedPrescriptions;
      default: return prescriptions;
    }
  };



  const filteredPrescriptions = getCurrentPrescriptions().filter(prescription => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      prescription.prescriptionId.toString().includes(searchTerm) ||
      prescription.userId.toString().includes(searchTerm) ||
      `rx-${prescription.prescriptionId.toString().padStart(4, '0')}`.includes(searchLower) ||
      `cus-${prescription.userId.toString().padStart(4, '0')}`.includes(searchLower);
    const matchesStatus = statusFilter === "All" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header with Statistics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            Prescription Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and monitor prescription submissions
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card sx={{ textAlign: 'center', p: 1, minWidth: 80, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {prescriptions.length}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              Total
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 1, minWidth: 80, backgroundColor: '#fff3e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              {pendingPrescriptions.length}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              Pending
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 1, minWidth: 80, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {verifiedPrescriptions.length}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              Verified
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 1, minWidth: 80, backgroundColor: '#ffebee' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
              {rejectedPrescriptions.length}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
              Rejected
            </Typography>
          </Card>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={prescriptionTab} onChange={handlePrescriptionTabChange} sx={{ mb: 3 }}>
            <Tab label="All" />
            <Tab label="Pending" />
            <Tab label="Verified" />
            <Tab label="Rejected" />
          </Tabs>

          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "primary.main" }} />,
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

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
                  Loading prescriptions...
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
              {filteredPrescriptions.length > 0 ? filteredPrescriptions.map((prescription) => (
                <Card key={prescription.prescriptionId} sx={{ 
                  p: 1.5, 
                  border: '1px solid #333333',
                  borderRadius: 1.5,
                  '&:hover': { boxShadow: 2 }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>
                        RX-{prescription.prescriptionId.toString().padStart(4, '0')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CUS-{prescription.userId.toString().padStart(4, '0')}
                      </Typography>
                    </Box>
                    <Chip 
                      label={prescription.status} 
                      color={getStatusColor(prescription.status)} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Upload Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {prescription.uploadedAt ? new Date(prescription.uploadedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  

                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <IconButton 
                      color="primary" 
                      size="small"
                      onClick={() => handleViewPrescription(prescription.prescriptionId)}
                      sx={{ bgcolor: '#e3f2fd' }}
                    >
                      <Visibility />
                    </IconButton>

                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeletePrescription(prescription.prescriptionId)}
                      sx={{ bgcolor: '#ffebee' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Card>
              )) : (
                <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No prescriptions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prescriptions will appear here when uploaded by customers
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Prescription Details - RX-{selectedPrescription?.prescriptionId.toString().padStart(4, '0')}
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Prescription ID</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>RX-{selectedPrescription.prescriptionId.toString().padStart(4, '0')}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Customer ID</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>CUS-{selectedPrescription.userId.toString().padStart(4, '0')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Status</Typography>
                    <Chip label={selectedPrescription.status} color={getStatusColor(selectedPrescription.status)} size="small" sx={{ height: '20px', fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Upload Date</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{new Date(selectedPrescription.uploadedAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Prescription File</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={async () => {
                        try {
                          const response = await prescriptionService.download(selectedPrescription.prescriptionId);
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          } else {
                            showSnackbar('Failed to load prescription file', 'error');
                          }
                        } catch (error) {
                          showSnackbar('Error loading prescription file', 'error');
                        }
                      }}
                    >
                      View Prescription File
                    </Button>
                  </Box>
                </Box>
                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mt: 1.5, mb: 0.5, fontSize: '1rem' }}>Medicines</Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medicine ID</TableCell>
                            <TableCell>Medicine Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Instructions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPrescription.medicines.map((medicine, index) => (
                            <TableRow key={index}>
                              <TableCell>MED-{medicine.medicineId.toString().padStart(4, '0')}</TableCell>
                              <TableCell>{medicine.medicineName || `MED-${medicine.medicineId.toString().padStart(4, '0')}`}</TableCell>
                              <TableCell>{medicine.quantity}</TableCell>
                              <TableCell>{medicine.dosage}</TableCell>
                              <TableCell>{medicine.instructions}</TableCell>
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

export default PrescriptionsManagement;