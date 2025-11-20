import { useState, useEffect } from "react";
import { Link as RouterLink, useSearchParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { LocalHospital, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { authService } from '../../services';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.resetPassword(token!, password);
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
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
              Reset Password
            </Typography>
            
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mb: 4, color: "#666" }}
            >
              Enter your new password below.
            </Typography>

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
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

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: "#0077b6" }} />,
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
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
              disabled={loading || !token}
              sx={{
                py: 1.5,
                mb: 3,
                backgroundColor: "#0077b6",
                "&:hover": { backgroundColor: "#023e8a" },
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;