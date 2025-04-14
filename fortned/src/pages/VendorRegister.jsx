import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    services: [{ name: '', duration: 30, price: '' }], // Add services array with default first service
    description: '', // Add business description field
    phoneNumber: '', // Add business phone number
    openingTime: '09:00',
    closingTime: '18:00'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const paymentToken = new URLSearchParams(location.search).get('token') || localStorage.getItem('paymentToken');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vendor/dashboard');
      return;
    }
    
    const verifyPayment = async () => {
      if (!paymentToken) {
        setVerifyingPayment(false);
        return;
      }
      
      try {
        setVerifyingPayment(true);
        
        setTimeout(() => {
          if (paymentToken) {
            setPaymentVerified(true);
            localStorage.setItem('paymentToken', paymentToken);
          } else {
            setPaymentVerified(false);
          }
          setVerifyingPayment(false);
        }, 1000);
        
      } catch (err) {
        console.error('Payment verification error:', err);
        setPaymentVerified(false);
        setVerifyingPayment(false);
      }
    };
    
    verifyPayment();
  }, [isAuthenticated, navigate, paymentToken]);

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
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  // Handle service field changes
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setFormData({ ...formData, services: updatedServices });
    
    // Clear service-specific errors
    if (formErrors.services && formErrors.services[index] && formErrors.services[index][field]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors.services[index][field];
      setFormErrors(updatedErrors);
    }
  };

  // Add new service row
  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', duration: 30, price: '' }]
    });
  };

  // Remove service row
  const removeService = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = [...formData.services];
      updatedServices.splice(index, 1);
      setFormData({ ...formData, services: updatedServices });
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
    
    if (!formData.location) {
      errors.location = 'Business location is required';
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Business phone number is required';
    }
    
    // Validate services
    const serviceErrors = [];
    let hasServiceError = false;
    
    formData.services.forEach((service, index) => {
      const sError = {};
      
      if (!service.name.trim()) {
        sError.name = 'Service name is required';
        hasServiceError = true;
      }
      
      if (!service.price || isNaN(service.price) || parseFloat(service.price) <= 0) {
        sError.price = 'Valid price is required';
        hasServiceError = true;
      }
      
      serviceErrors[index] = sError;
    });
    
    if (hasServiceError) {
      errors.services = serviceErrors;
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
    
    // Convert prices to numbers
    const processedFormData = {
      ...formData,
      services: formData.services.map(service => ({
        ...service,
        price: parseFloat(service.price),
        duration: parseInt(service.duration)
      }))
    };
    
    setLoading(true);
    try {
      await registerVendor(processedFormData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
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

  if (verifyingPayment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your subscription.</p>
          </div>
        </div>
      </>
    );
  }

  if (!paymentVerified) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <div className="text-center p-6">
                <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
                <p className="text-gray-600 mb-6">
                  You need to purchase a subscription plan before registering as a vendor.
                </p>
                <div className="flex flex-col space-y-3">
                  <Button
                    to="/#pricing"
                    fullWidth
                  >
                    View Pricing Plans
                  </Button>
                  <Button
                    to="/vendor/login"
                    variant="outline"
                    fullWidth
                  >
                    Already Have an Account? Login
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto"> {/* Increased width to accommodate service table */}
          <Card>
            <div className="text-center mb-6">
              <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Register Your Business</h2>
              <p className="mt-2 text-gray-600">Your payment was successful! Complete your registration below.</p>
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold text-lg text-blue-800">Business Information</h3>
                <p className="text-sm text-blue-600">Complete your business details below</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="Business Phone"
                  name="phoneNumber" 
                  value={formData.phoneNumber}
                  onChange={handleChange} 
                  placeholder="Your business phone"
                  error={formErrors.phoneNumber}
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
              </div>
              
              <Input 
                label="Location"
                name="location" 
                value={formData.location}
                onChange={handleChange} 
                placeholder="Your business location"
                error={formErrors.location}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your business"
                  rows={3}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              {/* Services Table */}
              <div className="mt-8">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <h3 className="font-semibold text-lg text-blue-800">Your Services</h3>
                  <p className="text-sm text-blue-600">Add services that customers can book</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 mb-2">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Service Name</th>
                        <th className="py-2 px-4 border-b text-left">Duration (mins)</th>
                        <th className="py-2 px-4 border-b text-left">Price (₹)</th>
                        <th className="py-2 px-4 border-b text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.services.map((service, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b">
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                              placeholder="Service name"
                              className={`w-full p-2 border rounded ${
                                formErrors.services && formErrors.services[index] && formErrors.services[index].name
                                  ? 'border-red-300'
                                  : 'border-gray-300'
                              }`}
                            />
                            {formErrors.services && formErrors.services[index] && formErrors.services[index].name && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.services[index].name}</p>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <select
                              value={service.duration}
                              onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              {[15, 30, 45, 60, 75, 90, 120].map(mins => (
                                <option key={mins} value={mins}>{mins} mins</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              className={`w-full p-2 border rounded ${
                                formErrors.services && formErrors.services[index] && formErrors.services[index].price
                                  ? 'border-red-300'
                                  : 'border-gray-300'
                              }`}
                            />
                            {formErrors.services && formErrors.services[index] && formErrors.services[index].price && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.services[index].price}</p>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {formData.services.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeService(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Another Service
                </button>
              </div>
              
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