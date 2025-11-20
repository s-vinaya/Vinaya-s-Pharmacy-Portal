import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HelpPage from './pages/HelpPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CustomerRegister from './pages/auth/CustomerRegister'
import PharmacistRegister from './pages/auth/PharmacistRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './contexts/CartContext'
import Sample from "./pages/pharmacist/sample";

function App() {
  return (
    <CartProvider>
      <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route path="/sample" element={<Sample/>}/>
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/pharmacist" element={<PharmacistRegister />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer/dashboard" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/pharmacist/dashboard" element={
          <ProtectedRoute allowedRoles={['Pharmacist']}>
            <PharmacistDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
