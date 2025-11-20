import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  LocalHospital,
  LocalPharmacy,
  Email,
  Lock,
  Phone,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { authService } from "../../services";
import type { RegisterPharmacistDto } from "../../types";
import loginImage from "../../assets/loginimage.jpg";

const PharmacistRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    licenseNumber: "",
    yearsOfExperience: "",
    licenseExpiryDate: "",
    qualification: "",
    stateOfLicense: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length > 100) {
      newErrors.name = "Name is required (max 100 characters)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !formData.email ||
      !emailRegex.test(formData.email) ||
      formData.email.length > 100
    ) {
      newErrors.email = "Valid email is required (max 100 characters)";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (
      !formData.password ||
      formData.password.length < 8 ||
      formData.password.length > 255 ||
      !passwordRegex.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits and start with 6, 7, 8, or 9";
    }

    if (!formData.licenseNumber || formData.licenseNumber.length < 5) {
      newErrors.licenseNumber = "License number is required (min 5 characters)";
    }

    if (
      !formData.yearsOfExperience ||
      parseInt(formData.yearsOfExperience) < 0 ||
      parseInt(formData.yearsOfExperience) > 50
    ) {
      newErrors.yearsOfExperience = "Years of experience must be between 0-50";
    }

    if (!formData.licenseExpiryDate) {
      newErrors.licenseExpiryDate = "License expiry date is required";
    }

    if (!formData.qualification) {
      newErrors.qualification = "Qualification is required";
    }

    if (!formData.stateOfLicense) {
      newErrors.stateOfLicense = "State of license is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const registrationData: RegisterPharmacistDto = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      yearsOfExperience: parseInt(formData.yearsOfExperience),
      licenseExpiryDate: formData.licenseExpiryDate,
      qualification: formData.qualification,
      stateOfLicense: formData.stateOfLicense,
    };

    try {
      const response = await authService.registerPharmacist(registrationData);
      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message:
            "Application submitted successfully! Please wait for admin approval.",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Registration failed. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#f8fafc",
      }}
    >
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #0077b6, #00b4d8)",
          boxShadow: 3,
        }}
      >
        <Toolbar>
          <LocalHospital sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            PharmaCare Portal
          </Typography>
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 500 }}
            component={RouterLink}
            to="/"
          >
            Home
          </Button>
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 500 }}
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Left Side - Image with Content */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          backgroundImage: `url(${loginImage})`,
          backgroundColor: '#0077b6',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 1
          }
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: 'white',
            p: 4,
            maxWidth: 380,
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-40px)',
            transition: 'all 0.3s ease'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                color: '#000000',
                textShadow: '2px 2px 4px rgba(255,255,255,0.9)',
                letterSpacing: '1px',
                fontFamily: 'Georgia, serif'
              }}
            >
              Join Our Team
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: '#000000',
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                letterSpacing: '0.5px',
                fontStyle: 'italic'
              }}
            >
              Professional Pharmacist Portal
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 2,
                color: '#000000',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                fontWeight: 500,
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                opacity: 0.98,
                background: 'rgba(255, 255, 255, 0.1)',
                p: 3,
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Apply to become a licensed pharmacist with our platform. Manage prescriptions, serve patients, and grow your professional career with comprehensive pharmacy management tools.
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Registration Form */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4,
          backgroundColor: '#f8fafc'
        }}>
          <Card sx={{ 
            width: '100%', 
            maxWidth: 600, 
            p: 4, 
            borderRadius: 6, 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)', 
            backgroundColor: "white",
            border: '1px solid rgba(0, 119, 182, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #0077b6, #023e8a)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <LocalPharmacy sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#023e8a', mb: 1 }}>
                  Pharmacist Registration
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Apply to join our pharmacy network
                </Typography>
              </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.name}
                    onChange={handleChange("name")}
                    error={!!errors.name}
                    helperText={errors.name || ""}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    error={!!errors.email}
                    helperText={errors.email || ""}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: value });
                    }}
                    error={!!errors.phone}
                    helperText={
                      errors.phone || "10 digits, must start with 6, 7, 8, or 9"
                    }
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="License Number *"
                    value={formData.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber || ""}
                    inputProps={{ maxLength: 50 }}
                    InputProps={{
                      startAdornment: <LocalPharmacy sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Experience *"
                    placeholder="Years of experience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleChange("yearsOfExperience")}
                    error={!!errors.yearsOfExperience}
                    helperText={errors.yearsOfExperience || ""}
                    inputProps={{ min: 0, max: 50 }}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="License Expiry Date *"
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange("licenseExpiryDate")}
                    error={!!errors.licenseExpiryDate}
                    helperText={errors.licenseExpiryDate || ""}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    select
                    label="Qualification *"
                    value={formData.qualification}
                    onChange={handleChange("qualification")}
                    error={!!errors.qualification}
                    helperText={errors.qualification || "Select your qualification"}
                    size="small"
                  >
                    <MenuItem value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</MenuItem>
                    <MenuItem value="PharmD">PharmD (Doctor of Pharmacy)</MenuItem>
                    <MenuItem value="M.Pharm">M.Pharm (Master of Pharmacy)</MenuItem>
                    <MenuItem value="Diploma in Pharmacy">Diploma in Pharmacy</MenuItem>
                    <MenuItem value="PhD in Pharmacy">PhD in Pharmacy</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="State of License *"
                    value={formData.stateOfLicense}
                    onChange={handleChange("stateOfLicense")}
                    error={!!errors.stateOfLicense}
                    helperText={errors.stateOfLicense || ""}
                    inputProps={{ maxLength: 50 }}
                    InputProps={{
                      startAdornment: <LocalPharmacy sx={{ mr: 1, color: "#0077b6" }} />,
                    }}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Password *"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    error={!!errors.password}
                    helperText={
                      errors.password || "Min 8 chars with special chars"
                    }
                    inputProps={{ maxLength: 255 }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: "#0077b6" }} />,
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword || ""}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: "#0077b6" }} />,
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                    size="small"
                  />
                </Box>
              </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={loading}
                size="large"
                sx={{
                  py: 1.5,
                  mt: 3,
                  mb: 2,
                  backgroundColor: "#0077b6",
                  "&:hover": { backgroundColor: "#023e8a" },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Apply as Pharmacist'}
              </Button>

              <Typography textAlign="center" variant="body2">
                Already have an account?{" "}
                <Button component={RouterLink} to="/login" sx={{ color: "#0077b6", textDecoration: "none" }}>
                  Login
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{ bgcolor: "#023e8a", color: "white", py: 1.5, textAlign: "center" }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} PharmaCare Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default PharmacistRegister;
