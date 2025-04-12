import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { registerVendor } from '../services/vendorService';
import { useAuth } from '../context/AuthContext';

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vendor/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const categoryOptions = [
    { value: 'salon', label: 'Salon' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'spa', label: 'Spa' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'dentist', label: 'Dental Clinic' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Business name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      await registerVendor(formData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after short delay
      setTimeout(() => {
        navigate('/vendor/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Register Your Business</h2>
              <p className="mt-2 text-gray-600">Create an account to start managing appointments</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Business Name"
                name="name" 
                value={formData.name}
                onChange={handleChange} 
                placeholder="Your business name"
                error={formErrors.name}
                required
              />
              
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
                placeholder="Create a password"
                error={formErrors.password}
                required
              />
              
              <Input 
                label="Confirm Password"
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange} 
                placeholder="Confirm your password"
                error={formErrors.confirmPassword}
                required
              />
              
              <Select
                label="Business Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                placeholder="Select business category"
                error={formErrors.category}
                required
              />
              
              <Input 
                label="Location"
                name="location" 
                value={formData.location}
                onChange={handleChange} 
                placeholder="Your business location"
                error={formErrors.location}
                required
              />
              
              <Button 
                type="submit" 
                fullWidth 
                isLoading={loading}
              >
                Register
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/vendor/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VendorRegister;
