import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  AppBar,
  Toolbar,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LocalHospital,
  ExpandMore,
  Person,
  LocalPharmacy,
  Settings,
  ShoppingCart,
  Description,

  Phone,
  Email,
  CheckCircle,
  Help,
} from "@mui/icons-material";

const HelpPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>("panel1");

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const faqs = [
    {
      id: "panel1",
      question: "How do I create an account?",
      answer:
        'You can create an account by clicking "Sign Up" on the homepage and choosing your role (Customer or Pharmacist). Fill in the required information and verify your email to get started.',
    },
    {
      id: "panel2",
      question: "How do I place an order for medicines?",
      answer:
        "As a customer, log in to your account, browse our medicine catalog, add items to your cart, upload prescription if required, and proceed to checkout with your delivery address.",
    },
    {
      id: "panel3",
      question: "Do I need a prescription for all medicines?",
      answer:
        "No, only prescription medicines require a valid prescription. Over-the-counter medicines can be ordered directly. Prescription-required medicines are clearly marked in our catalog.",
    },
    {
      id: "panel4",
      question: "How do I upload my prescription?",
      answer:
        "In your customer dashboard, go to buynow section then it will ask to upload prescription, You can upload images or PDF files of your prescription for pharmacist verification.",
    },
    {
      id: "panel5",
      question: "How long does prescription verification take?",
      answer:
        "Our licensed pharmacists typically verify prescriptions within 2-4 hours during business hours. You will receive a notification once your prescription is verified or if any issues are found.",
    },
    {
      id: "panel6",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI payments, net banking, and cash on delivery for eligible orders. All payments are processed securely.",
    },
    {
      id: "panel7",
      question: "How can I track my order?",
      answer:
        'You can track your order status in real-time from your dashboard under "My Orders". ',
    },
  ];

  const userGuides = [
    {
      role: "Customer",
      icon: <Person sx={{ color: "#0077b6" }} />,
      steps: [
        "Create your customer account",
        "Browse medicine catalog",
        "Upload prescription (if required)",
        "Add medicines to cart",
        "Provide delivery address",
        "Complete payment",
        "Track your order",
      ],
    },
    {
      role: "Pharmacist",
      icon: <LocalPharmacy sx={{ color: "#0077b6" }} />,
      steps: [
        "Apply for pharmacist account",
        "Wait for admin approval",
        "Manage medicine inventory",
        "Verify customer prescriptions",
        "Process customer orders",
        "Update order status",
        "Monitor stock levels",
      ],
    },
    {
      role: "Admin",
      icon: <Settings sx={{ color: "#0077b6" }} />,
      steps: [
        "Access admin dashboard",
        "Manage user accounts",
        "Approve pharmacist applications",
        "Monitor system analytics",
        "Manage medicine categories",
        "Handle customer support",
        "Generate reports",
      ],
    },
  ];

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(90deg, #0077b6, #00b4d8)" }}
      >
        <Toolbar>
          <LocalHospital sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Vinaya's Pharmacy - Help Center
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Back to Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
            background: "linear-gradient(135deg, #caf0f8 0%, #90e0ef 100%)",
            borderRadius: 4,
            py: 6,
            px: 4,
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #0077b6, #00b4d8)",
              borderRadius: "50%",
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 20px 40px rgba(0,119,182,0.3)",
            }}
          >
            <Help sx={{ fontSize: 50, color: "white" }} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#023e8a",
              mb: 2,
            }}
          >
            How can we help you?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "#023e8a", mb: 4, opacity: 0.8 }}
          >
            Find answers to common questions and learn how to use Vinaya's
            Pharmacy Portal
          </Typography>
        </Box>

        {/* Quick Links - Full Width */}
        <Box sx={{ mb: 6 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 8px 30px rgba(0,119,182,0.15)",
              border: "1px solid #e2e8f0",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,119,182,0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#023e8a",
                  mb: 4,
                  textAlign: "center",
                }}
              >
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/register/customer"
                  variant="outlined"
                  startIcon={<Person />}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 3,
                    borderColor: "#0077b6",
                    color: "#023e8a",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                    "&:hover": {
                      backgroundColor: "#caf0f8",
                      borderColor: "#023e8a",
                      transform: "translateX(8px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Sign Up as Customer
                </Button>
                <Button
                  component={RouterLink}
                  to="/register/pharmacist"
                  variant="outlined"
                  startIcon={<LocalPharmacy />}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 3,
                    borderColor: "#0077b6",
                    color: "#023e8a",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                    "&:hover": {
                      backgroundColor: "#caf0f8",
                      borderColor: "#023e8a",
                      transform: "translateX(8px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Apply as Pharmacist
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  startIcon={<Settings />}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 3,
                    borderColor: "#0077b6",
                    color: "#023e8a",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                    "&:hover": {
                      backgroundColor: "#caf0f8",
                      borderColor: "#023e8a",
                      transform: "translateX(8px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Login to Account
                </Button>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #caf0f8 0%, #90e0ef 100%)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#023e8a",
                    mb: 3,
                    textAlign: "center",
                  }}
                >
                  Contact Support
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "white",
                    }}
                  >
                    <Phone sx={{ color: "#0077b6", fontSize: 24 }} />
                    <Typography
                      component="a"
                      href="tel:+919876543210"
                      sx={{
                        color: "#023e8a",
                        textDecoration: "none",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        "&:hover": { color: "#0077b6" },
                      }}
                    >
                      +91 98765 43210
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "white",
                    }}
                  >
                    <Email sx={{ color: "#0077b6", fontSize: 24 }} />
                    <Typography
                      component="a"
                      href="mailto:support@vinayaspharmacy.com"
                      sx={{
                        color: "#023e8a",
                        textDecoration: "none",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        "&:hover": { color: "#0077b6" },
                      }}
                    >
                      support@vinayaspharmacy.com
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* FAQ Section - Full Width */}
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#023e8a", mb: 3 }}
          >
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleChange(faq.id)}
              sx={{
                mb: 2,
                borderRadius: 3,
                "&:before": { display: "none" },
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
                "&:hover": {
                  boxShadow: "0 8px 30px rgba(0,119,182,0.15)",
                  borderColor: "#0077b6",
                },
                transition: "all 0.3s ease",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "#0077b6" }} />}
                sx={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #caf0f8 0%, #f8fafc 100%)",
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#023e8a" }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* User Guides */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#023e8a",
              mb: 4,
              textAlign: "center",
            }}
          >
            Step-by-Step Guides
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {userGuides.map((guide, index) => (
              <Box key={index} sx={{ flex: 1 }}>
                <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      {guide.icon}
                      <Typography
                        variant="h6"
                        sx={{ ml: 1, fontWeight: "bold", color: "#023e8a" }}
                      >
                        {guide.role} Guide
                      </Typography>
                    </Box>
                    <List dense>
                      {guide.steps.map((step, stepIndex) => (
                        <ListItem key={stepIndex}>
                          <ListItemIcon>
                            <CheckCircle
                              sx={{ color: "#10b981", fontSize: 20 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{ fontSize: "0.9rem" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Features Overview */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#023e8a",
              mb: 4,
              textAlign: "center",
            }}
          >
            Platform Features
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                <CardContent>
                  <ShoppingCart
                    sx={{ color: "#0077b6", fontSize: 40, mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#023e8a", mb: 2 }}
                  >
                    Easy Medicine Ordering
                  </Typography>
                  <Typography sx={{ color: "#64748b", lineHeight: 1.6 }}>
                    Browse our extensive medicine catalog, add items to cart,
                    and place orders with just a few clicks. Our user-friendly
                    interface makes medicine ordering simple and secure.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                <CardContent>
                  <Description sx={{ color: "#0077b6", fontSize: 40, mb: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#023e8a", mb: 2 }}
                  >
                    Prescription Management
                  </Typography>
                  <Typography sx={{ color: "#64748b", lineHeight: 1.6 }}>
                    Upload and manage your prescriptions digitally. Our licensed
                    pharmacists verify all prescriptions to ensure safe and
                    accurate medicine dispensing.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Contact Section */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0,119,182,0.3)",
              background: "linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                Still need help?
              </Typography>
              <Typography sx={{ mb: 3, opacity: 0.9 }}>
                Our support team is here to assist you 24/7
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "white",
                    color: "#0077b6",
                    "&:hover": { bgcolor: "#f1faff" },
                  }}
                >
                  Contact Support
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#023e8a",
          color: "white",
          py: 3,
          textAlign: "center",
          mt: 4,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Vinaya's Pharmacy Portal. All rights
          reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HelpPage;
