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
  Chip,
  IconButton,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Edit,
  Delete,
  Add,
  Search,
  Warning,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { medicineService, categoryService } from "../../services";
import type { Medicine, Category, MedicineFormData, SnackbarState } from "../../types";

const MedicinesManagement = () => {
  const [medicineTab, setMedicineTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    description: "",
    categoryId: 1,
    price: "",
    stock: "",
    expiryDate: "",
    requiresPrescription: false,
    createdBy: 4,
    imageUrl: "",
  });
  const [errors, setErrors] = useState<Partial<MedicineFormData>>({});

  const dataFetched = useRef(false);

  useEffect(() => {
    if (!dataFetched.current) {
      dataFetched.current = true;
      fetchMedicines();
      fetchCategories();
    }
  }, []);

  

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      // Error fetching categories
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await medicineService.getAll();
      if (response.ok) {
        const data: Medicine[] = await response.json();
        setMedicines(data);
        
        // Filter low stock medicines from the same data (stock <= 10)
        const lowStock = data.filter(medicine => medicine.stock <= 10);
        setLowStockMedicines(lowStock);
        
        // Filter expiring medicines from the same data (expiring within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiring = data.filter(medicine => {
          if (!medicine.expiryDate) return false;
          const expiryDate = new Date(medicine.expiryDate);
          return expiryDate <= thirtyDaysFromNow;
        });
        setExpiringMedicines(expiring);
      }
    } catch (error) {
      // Error fetching medicines
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockMedicines = async () => {
    // This function is no longer needed as we filter from existing medicines data
    // But keeping it for compatibility with existing calls
    const lowStock = medicines.filter(medicine => medicine.stock <= 10);
    setLowStockMedicines(lowStock);
  };



  const handleMedicineTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setMedicineTab(newValue);
    setPage(1);
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ): void => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateMedicine = () => {
    setDialogMode("create");
    setFormData({
      name: "",
      description: "",
      categoryId: 1,
      price: "",
      stock: "",
      expiryDate: "",
      requiresPrescription: false,
      createdBy: 4,
      imageUrl: "",
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleEditMedicine = (medicine: Medicine): void => {
    console.log('Editing medicine:', medicine);
    setDialogMode("edit");
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name || "",
      description: medicine.description || "",
      categoryId: medicine.categoryId || 1,
      price: medicine.price?.toString() || "",
      stock: medicine.stock?.toString() || "",
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "",
      requiresPrescription: medicine.requiresPrescription || false,
      createdBy: medicine.createdBy || 4,
      imageUrl: medicine.imageUrl || "",
    });
    setOpenDialog(true);
  };



  const handleDeleteMedicine = async (medicineId: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const response = await medicineService.delete(medicineId);
        if (response.ok) {
          fetchMedicines();
          fetchLowStockMedicines();
          showSnackbar("Medicine deleted successfully", "success");
        }
      } catch (error) {
        console.error("Error deleting medicine:", error);
        showSnackbar("Error deleting medicine", "error");
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicineFormData> = {};
    
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
      const price = parseFloat(formData.price.toString());
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      } else if (price > 99999.99) {
        newErrors.price = "Price must not exceed ₹99,999.99";
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.toString())) {
        newErrors.price = "Price can have maximum 2 decimal places";
      }
    }
    
    // Stock validation
    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else {
      const stock = parseInt(formData.stock.toString());
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      } else if (stock > 99999) {
        newErrors.stock = "Stock must not exceed 99,999 units";
      } else if (!/^\d+$/.test(formData.stock.toString())) {
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

  const handleSaveMedicine = async () => {
    if (!validateForm()) return;
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        stock: parseInt(formData.stock.toString()),
        categoryId: parseInt(formData.categoryId.toString()),
      };

      const response =
        dialogMode === "create"
          ? await medicineService.create(payload)
          : await medicineService.update(selectedMedicine!.medicineId, payload);

      if (response.ok) {
        fetchMedicines();
        fetchLowStockMedicines();
        setOpenDialog(false);
        setErrors({});
        showSnackbar(
          dialogMode === "create"
            ? "Medicine created successfully"
            : "Medicine updated successfully",
          "success"
        );
      } else {
        showSnackbar("Error saving medicine", "error");
      }
    } catch (error) {
      showSnackbar("Error saving medicine", "error");
    }
  };

  const handleInputChange = (
    field: keyof MedicineFormData,
    value: string | number | boolean
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStockStatus = (
    stock: number
  ): {
    label: string;
    color: "error" | "warning" | "success";
    icon: React.ReactElement;
  } => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "error",
        icon: <Error sx={{ fontSize: 16 }} />,
      };
    if (stock < 10)
      return {
        label: "Low Stock",
        color: "warning",
        icon: <Warning sx={{ fontSize: 16 }} />,
      };
    return {
      label: "In Stock",
      color: "success",
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
    };
  };

  const getCurrentMedicines = (): Medicine[] => {
    switch (medicineTab) {
      case 0:
        return medicines;
      case 1:
        return lowStockMedicines;
      case 2:
        return expiringMedicines;
      default:
        return medicines;
    }
  };

  const filteredMedicines = getCurrentMedicines().filter((medicine) => {
    const matchesSearch = medicine.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter ||
      (categories.find((cat) => cat.categoryId === medicine.categoryId)
        ?.categoryName === categoryFilter) ||
      (categories.find((cat) => cat.categoryId === medicine.categoryId)?.name ===
        categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredMedicines.length / rowsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  useEffect(() => {
    setPage(1);
  }, [medicineTab, searchTerm, categoryFilter]);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header with Statistics */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {/* Left side - Header */}
        <Box sx={{ ml: 6 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            Medicine Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage medicines, stock levels, and inventory across the pharmacy
          </Typography>
        </Box>

        {/* Right side - Statistics */}
        <Box sx={{ display: "flex", gap: 1.5, maxWidth: 600 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "#e8f5e8",
                borderRadius: 2,
                boxShadow: 2,
                height: 80,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#4caf50", mb: 0.5 }}
              >
                {medicines.length}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Total Medicines
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "#fff3e0",
                borderRadius: 2,
                boxShadow: 2,
                height: 80,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#ff9800", mb: 0.5 }}
              >
                {lowStockMedicines.length}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Low Stock
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "#ffebee",
                borderRadius: 2,
                boxShadow: 2,
                height: 80,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#f44336", mb: 0.5 }}
              >
                {expiringMedicines.length}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Expiring Soon
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "#f3e5f5",
                borderRadius: 2,
                boxShadow: 2,
                height: 80,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#9c27b0", mb: 0.5 }}
              >
                {medicines.filter((m) => m.stock === 0).length}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Out of Stock
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ pl: 6, pr: 2 }}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ p: 3, background: "rgba(255,255,255,0.98)" }}>
            {/* Medicine Type Tabs */}
            <Tabs
              value={medicineTab}
              onChange={handleMedicineTabChange}
              sx={{ mb: 3 }}
            >
              <Tab label="All Medicines" />
              <Tab label="Low Stock" />
              <Tab label="Expiring Soon" />
            </Tabs>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "primary.main" }} />
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Filter by Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem
                      key={category.categoryId}
                      value={category.categoryName || category.name}
                    >
                      {category.categoryName || category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateMedicine}
              >
                Add Medicine
              </Button>
            </Box>

            {/* Medicines Table */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                sx={{
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                }}
              >
                <Table
                  sx={{
                    "& .MuiTableHead-root": {
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          py: 2,
                        }}
                      >
                        Image
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Medicine
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Category
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Stock
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Price (₹)
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Expiry Date
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMedicines.length > 0 ? (
                      paginatedMedicines.map((medicine, index) => {
                        const stockStatus = getStockStatus(medicine.stock);
                        return (
                          <TableRow
                            key={medicine.medicineId}
                            sx={{
                              background:
                                index % 2 === 0
                                  ? "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)"
                                  : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  bgcolor: "#f5f5f5",
                                }}
                              >
                                {medicine.imageUrl ? (
                                  <img
                                    src={medicine.imageUrl}
                                    alt={medicine.name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      height: "100%",
                                      color: "#999",
                                    }}
                                  >
                                    No Image
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {medicine.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {medicine.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              CAT-
                              {(medicine.categoryId || 0).toString().padStart(4, "0")}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography>{medicine.stock}</Typography>
                                {medicine.stock < 10 && (
                                  <Warning
                                    sx={{ color: "orange", fontSize: 20 }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>₹{medicine.price?.toFixed(2)}</TableCell>
                            <TableCell>
                              {medicine.expiryDate
                                ? new Date(
                                    medicine.expiryDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={stockStatus.icon}
                                label={stockStatus.label}
                                color={stockStatus.color}
                                size="small"
                                sx={{
                                  fontWeight: "bold",
                                  "& .MuiChip-icon": {
                                    fontSize: "16px",
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMedicine(medicine);
                                  }}
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #ff9800, #f57c00)",
                                    color: "white",
                                    width: 36,
                                    height: 36,
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #f57c00, #ef6c00)",
                                    },
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  <Edit sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedicine(medicine.medicineId);
                                  }}
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #f44336, #d32f2f)",
                                    color: "white",
                                    width: 36,
                                    height: 36,
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #d32f2f, #c62828)",
                                    },
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{ textAlign: "center", py: 4 }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No medicines found
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing{" "}
                  {Math.min(
                    (page - 1) * rowsPerPage + 1,
                    filteredMedicines.length
                  )}
                  -{Math.min(page * rowsPerPage, filteredMedicines.length)} of{" "}
                  {filteredMedicines.length} medicines
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* Medicine Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create"
            ? "Add New Medicine"
            : dialogMode === "edit"
            ? "Edit Medicine"
            : "Medicine Details"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: "1 1 300px" }}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={dialogMode === "view"}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Box>
              <Box sx={{ flex: "1 1 300px" }}>
                <FormControl fullWidth disabled={dialogMode === "view"} error={!!errors.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleInputChange("categoryId", e.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName || category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={dialogMode === "view"}
              error={!!errors.description}
              helperText={errors.description}
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: "1 1 300px" }}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  disabled={dialogMode === "view"}
                  error={!!errors.price}
                  helperText={errors.price}
                />
              </Box>
              <Box sx={{ flex: "1 1 300px" }}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  disabled={dialogMode === "view"}
                  error={!!errors.stock}
                  helperText={errors.stock}
                />
              </Box>
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry Date"
                value={
                  formData.expiryDate ? new Date(formData.expiryDate) : null
                }
                onChange={(newValue) => {
                  const dateString = newValue
                    ? newValue.toISOString().split("T")[0]
                    : "";
                  handleInputChange("expiryDate", dateString);
                }}
                minDate={new Date()}
                disabled={dialogMode === "view"}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expiryDate,
                    helperText: errors.expiryDate
                  }
                }}
              />
            </LocalizationProvider>
            <FormControl fullWidth disabled={dialogMode === "view"}>
              <InputLabel>Requires Prescription</InputLabel>
              <Select
                value={formData.requiresPrescription ? "true" : "false"}
                onChange={(e) =>
                  handleInputChange(
                    "requiresPrescription",
                    e.target.value === "true"
                  )
                }
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
              </Select>
            </FormControl>
            {dialogMode !== "view" && (
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  Upload Medicine Image
                  <input
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                          showSnackbar('Please select a valid image format (JPG, JPEG, PNG, GIF, WebP only)', 'error');
                          e.target.value = '';
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) { // 2MB limit for images
                          showSnackbar('Image size must be less than 2MB', 'error');
                          e.target.value = '';
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event: ProgressEvent<FileReader>) => {
                          if (event.target?.result) {
                            handleInputChange(
                              "imageUrl",
                              event.target.result as string
                            );
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
                {formData.imageUrl && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {dialogMode !== "view" && (
            <Button onClick={handleSaveMedicine} variant="contained">
              {dialogMode === "create" ? "Create" : "Update"}
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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicinesManagement;
