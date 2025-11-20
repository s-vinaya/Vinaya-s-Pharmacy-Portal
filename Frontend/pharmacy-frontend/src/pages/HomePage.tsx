import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import {
  LocalHospital,
  Person,
  LocalPharmacy,
  Settings,
  CheckCircle,
  Security,
  VerifiedUser,
  LocalShipping,
  HighQuality,
  TrackChanges
} from "@mui/icons-material";

const HomePage = () => {
  return (
    <Box sx={{ 
      width: "100vw", 
      margin: 0, 
      padding: 0, 
      overflowX: "hidden"
    }}>
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
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500, "&:hover": { backgroundColor: "white", color: "#0077b6" } }} component={RouterLink} to="/help">
            Help
          </Button>
          <Button color="inherit" sx={{ mx: 1, fontWeight: 500, "&:hover": { backgroundColor: "white", color: "#0077b6" } }} component={RouterLink} to="/login">
            Login
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/register/customer"
            sx={{
              mx: 1,
              fontWeight: 500,
              "&:hover": { backgroundColor: "white", color: "#0077b6" },
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(180deg, #caf0f8, #90e0ef)",
          py: 10,
          position: "relative",
          overflow: "hidden",
          color: "#023e8a",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 1200, mx: 'auto', px: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  background: "linear-gradient(45deg, #023e8a, #0077b6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "slideInLeft 1s ease-out",
                  "@keyframes slideInLeft": {
                    "0%": { opacity: 0, transform: "translateX(-50px)" },
                    "100%": { opacity: 1, transform: "translateX(0)" }
                  }
                }}
              >
                Welcome to
                <br />
                <Box component="span" sx={{ color: "#0077b6" }}>Vinaya's Pharmacy Portal</Box>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4,
                  color: "#023e8a",
                  fontWeight: 400,
                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                  animation: "slideInRight 1s ease-out 0.3s both",
                  "@keyframes slideInRight": {
                    "0%": { opacity: 0, transform: "translateX(50px)" },
                    "100%": { opacity: 1, transform: "translateX(0)" }
                  }
                }}
              >
                Your Trusted Digital Healthcare Partner 💊
                <br />
                <Box component="span" sx={{ fontSize: "1rem", opacity: 0.8 }}>
                  Fast • Secure • Reliable Medicine Delivery
                </Box>
              </Typography>
              <Box sx={{ 
                display: "flex", 
                gap: 2, 
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                animation: "fadeInUp 1s ease-out 0.6s both",
                "@keyframes fadeInUp": {
                  "0%": { opacity: 0, transform: "translateY(30px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                }
              }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register/customer"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    backgroundColor: "#0077b6",
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: "0 8px 25px rgba(0,119,182,0.3)",
                    "&:hover": { 
                      backgroundColor: "#023e8a",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(2,62,138,0.4)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Get Started Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="https://www.scnsoft.com/healthcare/patient-portals/pharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#0077b6",
                    borderColor: "#0077b6",
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#023e8a",
                      color: "#023e8a",
                      backgroundColor: "#caf0f8",
                      transform: "translateY(-2px)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 40%', minWidth: '300px' }}>
            <Box sx={{ textAlign: "right", mt: { xs: 4, md: 0 }, pl: { md: 4 } }}>
              <Box
                sx={{
                  position: "relative"
                }}
              >
                <Box
                  component="img"
                  src="https://www.freepnglogos.com/uploads/doctor-png/doctor-bulk-billing-doctors-chapel-hill-health-care-medical-3.png"
                  alt="Doctor"
                  sx={{
                    width: "100%",
                    maxWidth: 350,
                    height: "auto",
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
                    position: "relative",
                    zIndex: 2
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Who Are You Section */}
      <Box sx={{ py: 8, px: 4, backgroundColor: "white" }}>
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#023e8a" }}
        >
          WHO ARE YOU?
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            {
              icon: <Person sx={{ fontSize: 50, color: "#0077b6" }} />,
              title: "Customer",
              desc: "Order your medicines quickly and securely.",
              btn: "Sign Up",
              link: "/register/customer",
            },
            {
              icon: <LocalPharmacy sx={{ fontSize: 50, color: "#0077b6" }} />,
              title: "Pharmacist",
              desc: "Manage inventory and serve customers.",
              btn: "Apply Now",
              link: "/register/pharmacist",
            },
            {
              icon: <Settings sx={{ fontSize: 50, color: "#0077b6" }} />,
              title: "Admin",
              desc: "Control users and monitor the system.",
              btn: "Login",
              link: "/login",
            },
          ].map((item, index) => (
            <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  height: "100%",
                  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,119,182,0.15)",
                    borderColor: "#0077b6",
                    "& .card-icon": {
                      transform: "scale(1.1) rotate(5deg)"
                    }
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #0077b6, #00b4d8)"
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box 
                    className="card-icon"
                    sx={{ 
                      mb: 2,
                      p: 1.5,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0077b6, #00b4d8)",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(0,119,182,0.3)"
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 30, color: "white" } })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1.5, fontWeight: 600, color: "#023e8a" }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2.5, color: "#64748b", lineHeight: 1.5 }}
                  >
                    {item.desc}
                  </Typography>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={item.link}
                    sx={{
                      background: "linear-gradient(135deg, #0077b6, #00b4d8)",
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: "0 4px 15px rgba(0,119,182,0.3)",
                      "&:hover": { 
                        background: "linear-gradient(135deg, #023e8a, #0077b6)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(2,62,138,0.4)"
                      },
                      transition: "all 0.2s ease"
                    }}
                  >
                    {item.btn}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Features */}
      <Paper sx={{ py: 8, bgcolor: "#f7f9fb" }}>
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ mb: 6, fontWeight: "bold", color: "#023e8a" }}
        >
          WHY CHOOSE US?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', px: 4 }}>
          <Box sx={{ maxWidth: '1200px', width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {[
                {
                  icon: <Security sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Secure Prescription Upload",
                  desc: "End-to-end encryption for your medical data"
                },
                {
                  icon: <VerifiedUser sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Licensed Pharmacists",
                  desc: "Verified professionals ensuring medication safety"
                },
                {
                  icon: <LocalShipping sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Fast Delivery",
                  desc: "Same-day delivery for urgent medications"
                },
                {
                  icon: <HighQuality sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Quality Medicines",
                  desc: "Authentic medicines from trusted manufacturers"
                },
                {
                  icon: <CheckCircle sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Prescription Verification",
                  desc: "Expert pharmacist review for all prescriptions"
                },
                {
                  icon: <TrackChanges sx={{ fontSize: 40, color: "#0077b6" }} />,
                  title: "Easy Order Tracking",
                  desc: "Real-time updates on your order status"
                }
              ].map((feature, index) => (
                <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }} key={index}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: 220,
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,119,182,0.15)",
                        borderColor: "#0077b6",
                        "& .feature-icon": {
                          transform: "scale(1.1)",
                          background: "linear-gradient(135deg, #0077b6, #00b4d8)"
                        }
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: "linear-gradient(90deg, #0077b6, #00b4d8)"
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box 
                        className="feature-icon"
                        sx={{ 
                          mb: 2,
                          p: 2,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                          width: 70,
                          height: 70,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          transition: "all 0.3s ease",
                          border: "2px solid #e0f2fe"
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: 35, color: "#0077b6" } })}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, color: "#023e8a", fontSize: "1.1rem" }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", lineHeight: 1.5, px: 1 }}
                      >
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Footer */}
      <Box
        sx={{ 
          bgcolor: "#023e8a",
          color: "white",
          py: 6,
          textAlign: "center"
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Vinaya's Pharmacy Portal
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your trusted digital healthcare partner
        </Typography>
        <Typography variant="body2" color="#90e0ef">
          © 2024 Vinaya's Pharmacy Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
