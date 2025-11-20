import React, { useState, useEffect, useRef } from "react";
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { Visibility, CheckCircle, Cancel } from "@mui/icons-material";
import { prescriptionService } from '../../services';
import type { PharmacistPrescription } from '../../types';

const PrescriptionsManagement: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PharmacistPrescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<PharmacistPrescription | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openRejectDialog, setOpenRejectDialog] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [prescriptionToReject, setPrescriptionToReject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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
        const data: PharmacistPrescription[] = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      // Error fetching prescriptions
    }
  };

  const handleViewPrescription = (prescription: PharmacistPrescription): void => {
    console.log('Selected prescription:', prescription);
    console.log('FileUrl:', prescription.fileUrl);
    setSelectedPrescription(prescription);
    setOpenDialog(true);
  };

  const handleUpdatePrescriptionStatus = async (prescriptionId: number, newStatus: string, rejectionReason?: string): Promise<void> => {
    try {
      if (newStatus === 'Verified') {
        const response = await prescriptionService.verify(prescriptionId);
        if (response.ok) {
          fetchPrescriptions();
          setOpenDialog(false);
          alert('Prescription verified successfully!');
        }
      } else {
        const response = await prescriptionService.update(prescriptionId, { 
          status: newStatus, 
          remarks: rejectionReason || 'No reason provided' 
        });
        if (response.ok) {
          fetchPrescriptions();
          setOpenDialog(false);
          alert('Prescription rejected successfully!');
        }
      }
    } catch (error) {
      // Error updating prescription status
    }
  };

  const handleRejectClick = (prescriptionId: number): void => {
    setPrescriptionToReject(prescriptionId);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleConfirmReject = async (): Promise<void> => {
    if (prescriptionToReject && rejectionReason.trim()) {
      await handleUpdatePrescriptionStatus(prescriptionToReject, 'Rejected', rejectionReason.trim());
      setOpenRejectDialog(false);
      setPrescriptionToReject(null);
      setRejectionReason('');
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case "Verified": return "success";
      case "Rejected": return "error";
      case "Pending": return "warning";
      default: return "default";
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription: PharmacistPrescription) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      prescription.prescriptionId.toString().includes(searchTerm) ||
      prescription.userId.toString().includes(searchTerm) ||
      `rx-${prescription.prescriptionId.toString().padStart(4, '0')}`.includes(searchLower) ||
      `cus-${prescription.userId.toString().padStart(4, '0')}`.includes(searchLower);
    const matchesStatus = !statusFilter || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#023e8a", textAlign: "center" }}>
        Prescriptions Management
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <TextField
          placeholder="Search by Prescription ID or Customer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 300, width: '100%' }}
        />
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Verified">Verified</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ pl: 6, pr: 2 }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3, background: 'rgba(255,255,255,0.98)' }}>
            <TableContainer sx={{ 
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <Table sx={{ 
                '& .MuiTableHead-root': {
                  background: 'linear-gradient(135deg, #0077b6, #00b4d8)'
                },
                '& .MuiTableCell-root': {
                  borderRight: '1px solid rgba(0,0,0,0.08)'
                },
                '& .MuiTableCell-root:last-child': {
                  borderRight: 'none'
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      py: 2,
                      textAlign: 'center'
                    }}>Prescription ID</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>Customer ID</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>Upload Date</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrescriptions.length > 0 ? filteredPrescriptions.map((prescription: PharmacistPrescription, index) => (
                    <TableRow 
                      key={prescription.prescriptionId}
                      sx={{
                        background: index % 2 === 0 
                          ? 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' 
                          : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                      }}
                    >
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: '#1976d2',
                        fontSize: '0.95rem',
                        py: 2,
                        textAlign: 'center'
                      }}>
                        RX-{prescription.prescriptionId.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: '600',
                        color: '#424242',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                      }}>
                        CUS-{prescription.userId.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#000',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                      }}>
                        {new Date(prescription.uploadedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit"
                        })}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={prescription.status} 
                          color={getStatusColor(prescription.status)} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton color="primary" onClick={() => handleViewPrescription(prescription)}>
                          <Visibility />
                        </IconButton>
                        {prescription.status === 'Pending' && (
                          <>
                            <IconButton 
                              color="success" 
                              onClick={() => handleUpdatePrescriptionStatus(prescription.prescriptionId, 'Verified')}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleRejectClick(prescription.prescriptionId)}
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No prescriptions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Prescription Details - RX-{selectedPrescription?.prescriptionId.toString().padStart(4, '0')}</DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 150px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Prescription ID</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>RX-{selectedPrescription.prescriptionId.toString().padStart(4, '0')}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 150px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Customer ID</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>CUS-{selectedPrescription.userId.toString().padStart(4, '0')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 150px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Status</Typography>
                    <Chip label={selectedPrescription.status} color={getStatusColor(selectedPrescription.status)} size="small" sx={{ height: '20px', fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ flex: '1 1 150px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Upload Date</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{new Date(selectedPrescription.uploadedAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
                {selectedPrescription.remarks && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Remarks</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: selectedPrescription.status === 'Rejected' ? 'error.main' : 'text.primary' }}>
                      {selectedPrescription.remarks}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Prescription File</Typography>
                  <Card sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        bgcolor: '#fff', 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #e0e0e0'
                      }}>
                        <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
                          📄
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          Prescription Document
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded on {new Date(selectedPrescription.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={async () => {
                          try {
                            const response = await prescriptionService.download(selectedPrescription.prescriptionId);
                            
                            if (response.ok) {
                              const blob = await response.blob();
                              const blobUrl = URL.createObjectURL(blob);
                              window.open(blobUrl, '_blank');
                            } else {
                              const errorText = await response.text();
                              alert(`Error: ${response.status} - ${errorText}`);
                            }
                          } catch (error) {
                            alert(`Error: ${(error as Error).message}`);
                          }
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  </Card>
                </Box>
                {selectedPrescription.status === 'Pending' && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mt: 1.5, mb: 0.5, fontSize: '1rem' }}>Review Actions</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdatePrescriptionStatus(selectedPrescription.prescriptionId, 'Verified')}
                      >
                        Verify
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRejectClick(selectedPrescription.prescriptionId)}
                      >
                        Reject
                      </Button>
                    </Box>
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

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Prescription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this prescription:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionsManagement;