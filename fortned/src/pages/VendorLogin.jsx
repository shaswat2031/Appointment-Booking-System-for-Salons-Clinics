// src/pages/VendorLogin.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import ContactFooter from "../components/ContactFooter";

const VendorLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/vendor/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData);

    if (result.success) {
      navigate("/vendor/dashboard");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Vendor Login</h2>
              <p className="mt-2 text-gray-600">
                Sign in to access your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                error={formErrors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                error={formErrors.password}
                required
              />

              <Button type="submit" fullWidth isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/vendor/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Register
                </Link>
              </p>
            </div>

            <div className="px-6 pb-6">
              <ContactFooter />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VendorLogin;
