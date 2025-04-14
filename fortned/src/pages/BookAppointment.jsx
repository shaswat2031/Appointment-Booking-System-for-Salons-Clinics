// src/pages/BookAppointment.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { bookAppointment, getVendors } from '../services/publicService';
import React from 'react';

const BookAppointment = () => {
  const [formData, setFormData] = useState({ 
    phone: '', 
    customerName: '', 
    vendorId: '', 
    serviceName: 'Haircut', 
    time: '',
    date: new Date().toISOString().split('T')[0],
    customerEmail: '' // Add email field
  });
  const [message, setMessage] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const serviceCategories = {
    'salon': ['Haircut', 'Hair Coloring', 'Styling', 'Shaving', 'Facial', 'Manicure', 'Pedicure'],
    'clinic': ['Consultation', 'Check-up', 'Therapy Session', 'Vaccination', 'Treatment']
  };

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await getVendors();
        setVendors(response.data);
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
        setError('Failed to load vendors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'phone':
        if (value && (value.length !== 10 || !/^\d+$/.test(value))) {
          error = 'Phone number must be 10 digits';
        }
        break;
      case 'customerName':
        if (value && value.length < 3) {
          error = 'Name must be at least 3 characters';
        }
        break;
      case 'customerEmail':
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'time': {
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (value && !timePattern.test(value)) {
          error = 'Please use HH:MM format';
        }
        break;
      }
      default:
        break;
    }
    
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    Object.entries(formData).forEach(([name, value]) => {
      if (name === 'phone' || name === 'customerName' || name === 'vendorId' || 
          name === 'serviceName' || name === 'time' || name === 'date' || name === 'customerEmail') {
        if (!value) {
          errors[name] = `${name === 'vendorId' ? 'Professional' : name} is required`;
          isValid = false;
        } else {
          const fieldError = validateField(name, value);
          if (fieldError) {
            errors[name] = fieldError;
            isValid = false;
          }
        }
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  const hasErrors = () => {
    const touchedErrors = Object.keys(touchedFields)
      .filter(key => touchedFields[key])
      .some(key => formErrors[key]);
    return touchedErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      return;
    }
    
    setLoading(true);
    setBookingSuccess(false);
    
    try {
      setMessage('Processing your booking...');
      
      const res = await bookAppointment(formData);
      setMessage(res.data.message || 'Your appointment has been successfully booked!');
      setBookingSuccess(true);
      
      // Clear form after successful booking
      setFormData({ 
        phone: '', 
        customerName: '',
        vendorId: '', 
        serviceName: 'Haircut', 
        time: '',
        date: new Date().toISOString().split('T')[0],
        customerEmail: ''
      });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error("Booking error:", err);
      // Show specific error from the server if available
      setError(err.response?.data?.message || 'Unable to book your appointment. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVendor = vendors.find(vendor => vendor._id === formData.vendorId);
  const vendorCategory = selectedVendor?.category?.toLowerCase() || '';
  const availableServices = 
    vendorCategory.includes('salon') ? serviceCategories.salon :
    vendorCategory.includes('clinic') ? serviceCategories.clinic :
    [...serviceCategories.salon, ...serviceCategories.clinic];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Book Your Appointment</h2>
        <p className="text-center text-gray-600 mb-8">Schedule your visit with our top professionals in just a few clicks</p>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>}
        
        {bookingSuccess ? (
          <div className="text-center py-10 px-6 bg-green-50 rounded-lg border border-green-200">
            <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">You'll receive a confirmation via SMS shortly.</p>
            <button 
              onClick={() => setBookingSuccess(false)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
            >
              Book Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Your Name <span className="text-red-500">*</span></label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className={`w-full border ${formErrors.customerName ? 'border-red-300' : 'border-gray-300'} p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  />
                </div>
                {formErrors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full border ${formErrors.phone ? 'border-red-300' : 'border-gray-300'} p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`} 
                  />
                </div>
                {formErrors.phone ? (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                ) : (
                  <p className="text-xs text-gray-500">Format: 10 digit number</p>
                )}
              </div>
              
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    className={`w-full border ${formErrors.customerEmail ? 'border-red-300' : 'border-gray-300'} p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  />
                </div>
                {formErrors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.customerEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">Select Professional <span className="text-red-500">*</span></label>
                <select
                  id="vendorId"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  required
                  className={`w-full border ${formErrors.vendorId ? 'border-red-300' : 'border-gray-300'} p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                >
                  <option value="">Choose a professional</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} ({vendor.category})
                    </option>
                  ))}
                </select>
                {formErrors.vendorId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.vendorId}</p>
                )}
              </div>

              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Service <span className="text-red-500">*</span></label>
                <select
                  id="serviceName"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  required
                  className={`w-full border ${formErrors.serviceName ? 'border-red-300' : 'border-gray-300'} p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                >
                  {availableServices.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {formErrors.serviceName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.serviceName}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full border ${formErrors.date ? 'border-red-300' : 'border-gray-300'} p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                />
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className={`w-full border ${formErrors.time ? 'border-red-300' : 'border-gray-300'} p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                />
                {formErrors.time && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.time}</p>
                )}
              </div>
            </div>
            
            {/* Submit button changed to use the hasErrors function */}
            <div className="mt-8">
              <button 
                type="submit" 
                disabled={loading || hasErrors()}
                className={`w-full bg-blue-600 ${loading || hasErrors() ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default BookAppointment;
