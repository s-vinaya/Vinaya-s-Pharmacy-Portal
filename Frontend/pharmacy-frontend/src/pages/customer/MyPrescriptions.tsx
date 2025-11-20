import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Visibility, Close } from "@mui/icons-material";
import { prescriptionService } from '../../services';
import type { CustomerPrescription, SnackbarState } from '../../types';

interface MyPrescriptionsProps {
  onDataChange?: () => void;
}

const MyPrescriptions: React.FC<MyPrescriptionsProps> = ({ onDataChange }) => {
  const [prescriptions, setPrescriptions] = useState<CustomerPrescription[]>([]);
  const [openUploadDialog, setOpenUploadDialog] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; imageUrl: string }>({ open: false, imageUrl: '' });

  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchMyPrescriptions();
    }
  }, []);

  const fetchMyPrescriptions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await prescriptionService.getByUserId(parseInt(userId || '0'));
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleUploadPrescription = async () => {
    if (!selectedFile) {
      showSnackbar('Please select a file', 'error');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const response = await prescriptionService.upload(parseInt(userId || '0'), selectedFile);

      if (response.ok) {
        showSnackbar('Prescription uploaded successfully', 'success');
        setOpenUploadDialog(false);
        setSelectedFile(null);
        fetchMyPrescriptions();
        onDataChange?.();
      } else {
        showSnackbar('Failed to upload prescription', 'error');
      }
    } catch (error) {
      showSnackbar('Error uploading prescription', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewPrescription = async (prescriptionId: number) => {
    try {
      const response = await prescriptionService.download(prescriptionId);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setViewDialog({ open: true, imageUrl: url });
      } else {
        showSnackbar('Failed to load prescription', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading prescription', 'error');
    }
  };

  const handleCloseViewDialog = () => {
    if (viewDialog.imageUrl) {
      window.URL.revokeObjectURL(viewDialog.imageUrl);
    }
    setViewDialog({ open: false, imageUrl: '' });
  };

  const getStatusColor = (status: string): "warning" | "success" | "error" | "default" => {
    switch (status) {
      case "Pending": return "warning";
      case "Verified": return "success";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#023e8a" }}>
          My Prescriptions
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {prescriptions.length > 0 ? prescriptions.map((prescription) => (
          <Card key={prescription.prescriptionId} sx={{ 
            p: 1.5, 
            border: prescription.status === 'Rejected' ? '2px solid #f44336' : 
                   prescription.status === 'Verified' ? '2px solid #4caf50' : '2px solid #666666',
            borderRadius: 1.5,
            '&:hover': { boxShadow: 2 }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>
                RX-{prescription.prescriptionId.toString().padStart(4, '0')}
              </Typography>
              <Chip 
                label={prescription.status} 
                color={getStatusColor(prescription.status)} 
                size="small" 
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Upload Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {new Date(prescription.uploadedAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            {prescription.status === 'Rejected' && (
              <Box sx={{ mb: 1.5, p: 1, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Rejection Reason
                </Typography>
                <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                  {prescription.remarks || 'No reason provided'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => handleViewPrescription(prescription.prescriptionId)}
                sx={{ textTransform: 'none' }}
              >
                View File
              </Button>
            </Box>
          </Card>
        )) : (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No prescriptions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your first prescription to get started
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please upload a clear image or PDF of your prescription
            </Typography>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUploadPrescription} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={viewDialog.open} 
        onClose={handleCloseViewDialog} 
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '35vw',
            height: '90vh',
            maxWidth: 'none',
            maxHeight: 'none',
            m: 0
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6">Prescription Image</Typography>
          <IconButton onClick={handleCloseViewDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {viewDialog.imageUrl && (
            <Box
              component="img"
              src={viewDialog.imageUrl}
              alt="Prescription"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
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

export default MyPrescriptions;