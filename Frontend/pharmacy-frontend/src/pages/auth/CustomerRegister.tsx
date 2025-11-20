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
} from "@mui/material";
import {
  LocalHospital,
  Person,
  Email,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { authService } from "../../services";
import type { RegisterCustomerDto } from "../../types";
import "./CustomerRegister.css";

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const registrationData: RegisterCustomerDto = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    };

    try {
      const response = await authService.registerCustomer(registrationData);
      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: "Registration successful! Please login.",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
    <Box sx={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0 }}>
      <AppBar position="static" sx={{ background: "linear-gradient(90deg, #0077b6, #00b4d8)", boxShadow: 3 }}>
        <Toolbar>
          <LocalHospital sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Vinaya's Pharmacy
          </Typography>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Left Side - Register Form */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4,
          backgroundColor: '#f8fafc'
        }}>
          <Card sx={{ width: '100%', maxWidth: 450, p: 3, borderRadius: 4, boxShadow: 8, backgroundColor: "white" }}>
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
                <Person sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#023e8a', mb: 1 }}>
                Sign Up as Customer
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Create your account to get started
              </Typography>
            </Box>

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
              sx={{ mb: 2 }}
            />

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
              sx={{ mb: 2 }}
            />

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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password *"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password || "Min 8 chars with special chars"}
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
              sx={{ mb: 2 }}
            />

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
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
              size="large"
              sx={{
                py: 1.5,
                mb: 2,
                backgroundColor: "#0077b6",
                "&:hover": { backgroundColor: "#023e8a" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Register as Customer"
              )}
            </Button>

            <Typography textAlign="center" variant="body2">
              Already have an account?{" "}
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: "#0077b6", textDecoration: "none" }}
              >
                Login
              </Button>
            </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right Side - Image */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2079&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          <Box sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: 'white',
            p: 6,
            maxWidth: 480,

            backdropFilter: 'blur(15px)',
            borderRadius: '25px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-50px)',
            transition: 'all 0.3s ease'
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900, 
                mb: 3,
                fontSize: { xs: '2.2rem', md: '3rem' },
                color: '#000000',
                textShadow: '2px 2px 4px rgba(255,255,255,0.9)',
                letterSpacing: '2px',
                fontFamily: 'Georgia, serif'
              }}
            >
              Join Our Community
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4, 
                fontWeight: 700,
                color: '#000000',
                fontSize: { xs: '1.4rem', md: '1.8rem' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                letterSpacing: '1px',
                fontStyle: 'italic'
              }}
            >
              Your Health Journey Starts Here
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
              Sign up today to access our comprehensive pharmacy services, manage your prescriptions, and enjoy convenient doorstep delivery.
            </Typography>
          </Box>
        </Box>
      </Box>

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

      <Box sx={{ bgcolor: "#023e8a", color: "white", py: 3, textAlign: "center" }}>
        <Typography sx={{ mb: 1 }}>
          About | Contact | Privacy | Terms | Help
        </Typography>
        <Typography variant="body2">
          © {new Date().getFullYear()} Vinaya's Pharmacy Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomerRegister;
