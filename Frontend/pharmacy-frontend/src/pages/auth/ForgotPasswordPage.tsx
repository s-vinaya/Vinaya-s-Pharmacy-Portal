import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { LocalHospital, Email } from "@mui/icons-material";
import { authService } from '../../services';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      const data = await response.json();
      
      if (response.ok) {
        setMessage("If the email exists, a password reset link has been sent to your email.");
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: "100vw", 
      minHeight: "100vh",
      margin: 0, 
      padding: 0, 
      background: "linear-gradient(180deg, #caf0f8, #90e0ef)",
    }}>
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
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500 }} component={RouterLink} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 140px)",
          py: 4,
        }}
      >
        <Card
          sx={{
            width: 400,
            p: 4,
            borderRadius: 4,
            boxShadow: 8,
            backgroundColor: "white",
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              textAlign="center"
              sx={{ mb: 2, fontWeight: "bold", color: "#023e8a" }}
            >
              Forgot Password
            </Typography>
            
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mb: 4, color: "#666" }}
            >
              Enter your email address and we'll send you a link to reset your password.
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

            {error && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: "#ffebee", borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                  {error}
                </Typography>
              </Box>
            )}

            {message && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: "#e8f5e8", borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                  {message}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 3,
                backgroundColor: "#0077b6",
                "&:hover": { backgroundColor: "#023e8a" },
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: "#0077b6" }}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{ bgcolor: "#023e8a", color: "white", py: 3, textAlign: "center" }}
      >
        <Typography sx={{ mb: 1 }}>
          About | Contact | Privacy | Terms | Help
        </Typography>
        <Typography variant="body2">
          © {new Date().getFullYear()} PharmaCare Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;