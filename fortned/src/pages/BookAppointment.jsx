// src/pages/BookAppointment.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { bookAppointment, getVendors } from '../services/publicService';
import React from 'react';

const BookAppointment = () => {
  const [formData, setFormData] = useState({ 
    phone: '', 
    vendorId: '', 
    serviceName: 'Haircut', // Default service
    time: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });
  const [message, setMessage] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Common service categories based on salon/clinic context
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

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setBookingSuccess(false);
    try {
      const res = await bookAppointment(formData);
      setMessage(res.data.message || 'Your appointment has been successfully booked!');
      setBookingSuccess(true);
      setFormData({ 
        phone: '', 
        vendorId: '', 
        serviceName: 'Haircut', 
        time: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Booking error:", err);
      setMessage('Unable to book your appointment. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Find selected vendor category
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
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input 
                    id="phone"
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    placeholder="Enter your phone number" 
                    required
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                  />
                </div>
                <p className="text-xs text-gray-500">Format: 10 digit number</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="vendorSelect" className="block text-sm font-medium text-gray-700">
                  Select Professional <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <select
                    id="vendorSelect"
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">-- Select a professional --</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name} - {vendor.category}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">Choose from our list of qualified professionals</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">
                  Service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  <select 
                    id="serviceName"
                    name="serviceName" 
                    value={formData.serviceName}
                    required
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">-- Select a service --</option>
                    {availableServices.map(service => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">Select the service you need</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input 
                    id="date"
                    type="date" 
                    name="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    required
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                  />
                </div>
                <p className="text-xs text-gray-500">Choose your preferred date</p>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <input 
                    id="time"
                    type="time" 
                    name="time" 
                    value={formData.time}
                    required
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                  />
                </div>
                <p className="text-xs text-gray-500">Select a convenient time slot (business hours: 9:00 AM - 7:00 PM)</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
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
            
            {message && !bookingSuccess && (
              <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Booking Error</p>
                <p>{message}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-6">
              <p className="mb-2">
                <span className="font-medium">Note:</span> We'll confirm your appointment via SMS after submission.
              </p>
              <p>
                <span className="font-medium">Cancellation policy:</span> Please cancel at least 4 hours before your appointment to avoid charges.
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default BookAppointment;
