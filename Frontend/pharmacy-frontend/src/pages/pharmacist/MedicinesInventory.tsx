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
  Paper,
  Chip,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Search,
  Warning,
  CheckCircle,
  Add,
  Edit,
  Inventory,
  Delete,
} from "@mui/icons-material";
import { medicineService, categoryService } from "../../services";
import type { Medicine, Category, MedicineInventoryFormData } from "../../types";

const MedicinesInventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<MedicineInventoryFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    requiresPrescription: false,
    imageUrl: "",
    expiryDate: "",
  });
  const [errors, setErrors] = useState<Partial<MedicineInventoryFormData>>({});
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchMedicines();
      fetchCategories();
    }
  }, []);

  const fetchMedicines = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await medicineService.getAll();
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await categoryService.getAll();
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getStockStatus = (
    stock: number
  ): {
    label: string;
    color: "error" | "warning" | "success";
    icon: React.ReactElement;
  } => {
    if (stock === 0)
      return { label: "Out of Stock", color: "error", icon: <Warning /> };
    if (stock < 10)
      return { label: "Low Stock", color: "warning", icon: <Warning /> };
    return { label: "In Stock", color: "success", icon: <CheckCircle /> };
  };

  const filteredMedicines = medicines.filter((medicine: Medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || medicine.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockMedicines = medicines.filter(
    (medicine: Medicine) => medicine.stock < 10 && medicine.stock > 0
  );
  const outOfStockMedicines = medicines.filter(
    (medicine: Medicine) => medicine.stock === 0
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicineInventoryFormData> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Medicine name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Medicine name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Medicine name must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-\.\(\)]+$/.test(formData.name.trim())) {
      newErrors.name = "Medicine name contains invalid characters";
    }
    
    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }
    
    // Price validation
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      } else if (price > 99999.99) {
        newErrors.price = "Price must not exceed ₹99,999.99";
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
        newErrors.price = "Price can have maximum 2 decimal places";
      }
    }
    
    // Stock validation
    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      } else if (stock > 99999) {
        newErrors.stock = "Stock must not exceed 99,999 units";
      } else if (!/^\d+$/.test(formData.stock)) {
        newErrors.stock = "Stock must be a whole number";
      }
    }
    
    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    
    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate <= today) {
        newErrors.expiryDate = "Expiry date must be in the future";
      }
      
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      if (expiryDate > maxDate) {
        newErrors.expiryDate = "Expiry date cannot be more than 10 years from now";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMedicine = (): void => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      requiresPrescription: false,
      imageUrl: "",
      expiryDate: "",
    });
    setSelectedMedicine(null);
    setIsEditing(false);
    setErrors({});
    setOpenDialog(true);
  };

  const handleEditMedicine = (medicine: Medicine): void => {
    setFormData({
      name: medicine.name,
      description: medicine.description || "",
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      categoryId: medicine.categoryId || "",
      requiresPrescription: medicine.requiresPrescription || false,
      imageUrl: medicine.imageUrl || "",
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "",
    });
    setSelectedMedicine(medicine);
    setIsEditing(true);
    setErrors({});
    setOpenDialog(true);
  };

  const handleUpdateStock = async (
    medicineId: number,
    newStock: number
  ): Promise<void> => {
    try {
      const response = await medicineService.updateStock(medicineId, newStock);
      if (response.ok) {
        fetchMedicines();
        alert("Stock updated successfully!");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: (e.target?.result as string) || "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMedicine = async (medicineId: number): Promise<void> => {
    try {
      const response = await medicineService.delete(medicineId);
      if (response.ok) {
        fetchMedicines();
        alert("Medicine deleted successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete medicine" }));
        alert(errorData.message || "Failed to delete medicine. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Error deleting medicine. Please try again.");
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    try {
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId:
          typeof formData.categoryId === "string"
            ? parseInt(formData.categoryId)
            : formData.categoryId,
      };

      const response = isEditing
        ? await medicineService.update(
            selectedMedicine!.medicineId,
            medicineData
          )
        : await medicineService.create(medicineData);

      if (response.ok) {
        fetchMedicines();
        setOpenDialog(false);
        setErrors({});
        alert(`Medicine ${isEditing ? "updated" : "created"} successfully!`);
      }
    } catch (error) {
      console.error("Error saving medicine:", error);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#023e8a",
          textAlign: "center",
          mb: 1,
          mt: 0,
        }}
      >
        Medicines Inventory
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 0 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            maxWidth: 800,
            width: "100%",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <Box sx={{ flex: "1 1 300px" }}>
            <TextField
              fullWidth
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "#666" }} />,
              }}
            />
          </Box>
          <Box sx={{ flex: "1 1 300px" }}>
            <TextField
              fullWidth
              select
              label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ minWidth: 250 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category: Category) => (
                <MenuItem
                  key={category.categoryId}
                  value={category.categoryName}
                >
                  {category.categoryName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAddMedicine}
            sx={{ minWidth: 150 }}
          >
            Add Medicine
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
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
                Loading medicines inventory...
              </Typography>
            </Box>
          </Box>
        ) : (
          <Card sx={{ border: "1px solid #666666" }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Medicine Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Price (₹)</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Expiry Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Prescription</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedicines.length > 0 ? filteredMedicines.map((medicine: Medicine) => {
                  const stockStatus = getStockStatus(medicine.stock);
                  return (
                    <TableRow key={medicine.medicineId}>
                      <TableCell>
                        <Box sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                          {medicine.imageUrl ? (
                            <img 
                              src={medicine.imageUrl} 
                              alt={medicine.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                              No Image
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {medicine.name}
                          </Typography>
                          {medicine.description && (
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {medicine.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{medicine.categoryName}</TableCell>
                      <TableCell>₹{medicine.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: medicine.stock === 0 ? '#d32f2f' : medicine.stock < 10 ? '#ed6c02' : '#2e7d32'
                          }}
                        >
                          {medicine.stock} units
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={stockStatus.label} 
                          color={stockStatus.color} 
                          size="small"
                          icon={stockStatus.icon}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={medicine.requiresPrescription ? "Yes" : "No"} 
                          color={medicine.requiresPrescription ? "error" : "success"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEditMedicine(medicine)}>
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="secondary" 
                          onClick={() => {
                            const newStock = prompt(`Update stock for ${medicine.name}:`, medicine.stock.toString());
                            if (newStock !== null) handleUpdateStock(medicine.medicineId, parseInt(newStock));
                          }}
                        >
                          <Inventory />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
                              handleDeleteMedicine(medicine.medicineId);
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No medicines found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => setCategoryFilter("")}
          disabled={!categoryFilter}
        >
          Clear Filters
        </Button>
        <Button 
          variant="outlined" 
          color="warning"
          onClick={() => {
            const lowStockNames = lowStockMedicines.map((m: Medicine) => m.name).join(', ');
            alert(`Low Stock Medicines: ${lowStockNames || 'None'}`);
          }}
        >
          View Low Stock ({lowStockMedicines.length})
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => {
            const outOfStockNames = outOfStockMedicines.map((m: Medicine) => m.name).join(', ');
            alert(`Out of Stock Medicines: ${outOfStockNames || 'None'}`);
          }}
        >
          View Out of Stock ({outOfStockMedicines.length})
        </Button>
      </Box>

      {/* Add/Edit Medicine Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Medicine Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                error={!!errors.description}
                helperText={errors.description}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    error={!!errors.price}
                    helperText={errors.price}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    error={!!errors.stock}
                    helperText={errors.stock}
                  />
                </Box>
              </Box>
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  {categories.map((category: Category) => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.categoryId}
                  </Typography>
                )}
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={formData.expiryDate ? new Date(formData.expiryDate) : null}
                  onChange={(newValue) => {
                    const dateString = newValue ? newValue.toISOString().split('T')[0] : '';
                    setFormData(prev => ({ ...prev, expiryDate: dateString }));
                  }}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.expiryDate,
                      helperText: errors.expiryDate
                    }
                  }}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                select
                label="Requires Prescription"
                value={formData.requiresPrescription ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, requiresPrescription: e.target.value === 'true'})}
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
              </TextField>
              <Button variant="outlined" component="label" fullWidth>
                Upload Medicine Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {formData.imageUrl && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicinesInventory;