// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import CancelAppointment from "./pages/CancelAppointment";
import VendorLogin from "./pages/VendorLogin";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import BookWithVendor from "./pages/BookWithVendor";
import VendorIdPage from "./pages/VendorIdPage"; // New import for VendorIdPage
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/book/:vendorId" element={<BookWithVendor />} />
          <Route path="/cancel" element={<CancelAppointment />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/payment/:plan" element={<Payment />} />
          // Add this to your routes
          <Route path="/vendor/:vendorId" element={<VendorIdPage />} />
          {/* Protected routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
