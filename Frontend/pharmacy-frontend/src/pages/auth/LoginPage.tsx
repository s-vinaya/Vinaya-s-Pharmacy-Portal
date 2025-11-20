import  { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from "../../services";
import loginImage from "../../assets/login.png";
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

  Alert,
} from "@mui/material";
import {
  LocalHospital,
  Email,
  Lock,
  Person,
  LocalPharmacy,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  const handleLogin = async () => {
    
    if (!email || !password) {
      setSnackbar({ open: true, message: 'Please enter both email and password', severity: 'error' });
      return;
    }
    
    try {
      const response = await authService.login(email, password);
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userId", data.userId);
        
        if (data.role === "Admin") {
          navigate("/admin/dashboard");
        } else if (data.role === "Customer") {
          navigate("/customer/dashboard");
        } else if (data.role === "Pharmacist") {
          navigate("/pharmacist/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setSnackbar({ open: true, message: data.message || 'Login failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Network error. Please try again.', severity: 'error' });
    }
  };



  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0 }}>
      {/* Header */}
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
            Vinaya's Pharmacy
          </Typography>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/help">
            Help
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Left Side - Image */}
        <Box sx={{ 
          flex: 1, 
          minHeight: '110vh',
          backgroundImage: `url(${loginImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: 'white',
            p: 4,
            maxWidth: 380,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
              Welcome Back
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
              Your Health Partner
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.6,
                color: '#000000',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                opacity: 0.95,
                background: 'rgba(255, 255, 255, 0.1)',
                p: 2,
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Access your account to manage prescriptions, track orders, and connect with healthcare professionals for all your pharmacy needs.
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4,
          backgroundColor: '#f8fafc'
        }}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              p: 4,
              borderRadius: 4,
              boxShadow: 8,
              backgroundColor: "white",
              marginTop: '-50px'
            }}
          >
          <CardContent>
            <Typography
              variant="h4"
              textAlign="center"
              sx={{ mb: 4, fontWeight: "bold", color: "#023e8a" }}
            >
              LOGIN
            </Typography>

            <TextField
              fullWidth
              label="Email Address *"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: "#0077b6" }} />,
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: "#0077b6" }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{
                py: 1.5,
                mb: 1,
                backgroundColor: "#0077b6",
                "&:hover": { backgroundColor: "#023e8a" },
              }}
            >
              LOGIN
            </Button>

            <Box sx={{ textAlign: "center", mb: 0.2 }}>
              <Button
                component={RouterLink}
                to="/forgot-password"
                sx={{ color: "#0077b6", textDecoration: "underline", fontSize: "0.7rem", p: 0 }}
              >
                Forgot Password?
              </Button>
            </Box>

            <Typography textAlign="center" variant="body2" sx={{ mb: 1.5 }}>
              Don't have an account?
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Person />}
                component={RouterLink}
                to="/register/customer"
                sx={{
                  color: "#0077b6",
                  borderColor: "#0077b6",
                  "&:hover": { backgroundColor: "#f1faff" },
                }}
              >
                Sign up as Customer
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalPharmacy />}
                component={RouterLink}
                to="/register/pharmacist"
                sx={{
                  color: "#0077b6",
                  borderColor: "#0077b6",
                  "&:hover": { backgroundColor: "#f1faff" },
                }}
              >
                Apply as Pharmacist
              </Button>
            </Box>
            
            {snackbar.open && (
              <Alert severity={snackbar.severity} sx={{ mt: 2 }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                {snackbar.message}
              </Alert>
            )}
          </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{ bgcolor: "#023e8a", color: "white", py: 3, textAlign: "center" }}
      >
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

export default LoginPage;