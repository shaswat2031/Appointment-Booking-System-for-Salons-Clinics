// src/pages/CancelAppointment.jsx
import React, { useState, useEffect } from 'react';
import { cancelAppointment, searchAppointmentsByPhone } from '../services/publicService';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const CancelAppointment = () => {
  const location = useLocation();
  const preSelectedPhone = location.state?.preSelectedPhone || '';
  const preSelectedAppointment = location.state?.preSelectedAppointment;

  const [formData, setFormData] = useState({
    phone: preSelectedPhone,
    token: preSelectedAppointment?.token || '',
    vendorId: preSelectedAppointment?.vendorId || '',
    appointmentId: preSelectedAppointment?.id || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(
    preSelectedAppointment ? {
      service: preSelectedAppointment.service,
      date: preSelectedAppointment.date,
      time: preSelectedAppointment.time,
      vendorName: preSelectedAppointment.vendorName
    } : null
  );
  const navigate = useNavigate();

  // Fetch appointments when component loads if phone is provided
  useEffect(() => {
    if (preSelectedPhone && preSelectedPhone.length >= 10) {
      fetchAppointments(preSelectedPhone);
    }
  }, [preSelectedPhone]);

  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;
    setFormData({
      ...formData,
      phone: phoneValue
    });
    
    // If phone number is being changed and has 10 digits, fetch appointments
    if (phoneValue.length === 10) {
      fetchAppointments(phoneValue);
    }
  };

  const fetchAppointments = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length !== 10) return;
    
    setFetchingAppointments(true);
    setError('');
    
    // Only clear selected appointment if it's not pre-selected from navigation
    if (!preSelectedAppointment) {
      setSelectedAppointmentDetails(null);
    }
    
    try {
      const response = await searchAppointmentsByPhone(phoneNumber);
      if (response.data && response.data.success && response.data.appointments) {
        const activeAppointments = response.data.appointments.filter(apt => 
          apt.status !== 'cancelled' && apt.status !== 'done'
        );
        setAppointments(activeAppointments);
        
        // If we have a preSelectedAppointment, highlight it
        if (preSelectedAppointment && preSelectedAppointment.id) {
          const matchingAppointment = activeAppointments.find(apt => apt.id === preSelectedAppointment.id);
          if (matchingAppointment) {
            handleAppointmentSelect(matchingAppointment);
          }
        }
        
        // If no appointments found, show clear message
        if (activeAppointments.length === 0) {
          setError('No active appointments found for this phone number.');
        }
      } else {
        setAppointments([]);
        setError('No appointments found. Check your phone number or enter booking details manually.');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 
        'Could not fetch appointments. Please enter your booking token manually.');
      setAppointments([]);
    } finally {
      setFetchingAppointments(false);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    // Highlight the selected appointment in the UI
    const appointmentElement = document.getElementById(`appointment-${appointment.id}`);
    if (appointmentElement) {
      // Remove highlight from any previously selected appointment
      document.querySelectorAll('.appointment-item').forEach(item => 
        item.classList.remove('bg-blue-100', 'border-l-4', 'border-blue-500'));
      
      // Add highlight to selected appointment
      appointmentElement.classList.add('bg-blue-100', 'border-l-4', 'border-blue-500');
    }
    
    setFormData({
      ...formData,
      token: appointment.token,
      appointmentId: appointment.id,
      vendorId: appointment.vendorId || ''
    });
    
    setSelectedAppointmentDetails({
      service: appointment.service,
      date: appointment.date,
      time: appointment.time || appointment.timeSlot,
      vendorName: appointment.vendorName
    });
  };

  const handleCancelRequest = (e) => {
    e.preventDefault();
    if (!formData.token || !formData.phone) {
      setError('Please provide both phone number and booking token');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Add additional validation
    if (!formData.phone || (!formData.token && !formData.appointmentId)) {
      setError('Please provide both phone number and booking information');
      setLoading(false);
      return;
    }
    
    try {
      // Apply optimistic UI update - show cancellation is in progress
      setSuccess('Processing your cancellation request...');
      
      const response = await cancelAppointment({
        phone: formData.phone,
        token: formData.token,
        appointmentId: formData.appointmentId
      });
      
      setSuccess(response.data.message || 'Appointment cancelled successfully!');
      setFormData({ phone: '', token: '', vendorId: '', appointmentId: '' });
      setShowConfirmation(false);
      setAppointments([]);
      setSelectedAppointmentDetails(null);
      
      // Add confetti effect for visual feedback
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment. Please check your details.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 my-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Cancel Your Appointment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cancellation Form */}
          <div>
            <Card className="shadow-lg border border-gray-100 h-full">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
                <p className="mt-2 text-gray-600">Enter your phone number and select your appointment</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleCancelRequest} className="space-y-5">
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter the phone number used for booking"
                  required
                />

                {fetchingAppointments && (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-500">Fetching your appointments...</span>
                  </div>
                )}

                {appointments.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Select Your Appointment
                    </label>
                    <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden max-h-56 overflow-y-auto">
                      {appointments.map((appointment) => (
                        <div 
                          id={`appointment-${appointment.id}`}
                          key={appointment.id || appointment.token} 
                          className={`appointment-item p-3 cursor-pointer hover:bg-blue-50 ${
                            formData.appointmentId === appointment.id 
                              ? 'bg-blue-100 border-l-4 border-blue-500' 
                              : 'bg-white border-b border-gray-100'
                          }`}
                          onClick={() => handleAppointmentSelect(appointment)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{appointment.service}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.date).toLocaleDateString()} - {appointment.time || appointment.timeSlot}
                              </p>
                              <p className="text-sm text-gray-500 mt-1 font-medium">
                                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                  {appointment.vendorName || "Unknown Provider"}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm bg-blue-100 text-blue-800 rounded px-2 py-1">
                                Token: <span className="font-bold">{appointment.token}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appointments.length === 0 && formData.phone.length >= 10 && !fetchingAppointments && (
                  <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg">
                    <p className="font-medium">No active appointments found</p>
                    <p className="text-sm mt-1">Please check the phone number or enter your booking token manually</p>
                  </div>
                )}

                {selectedAppointmentDetails && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Appointment</h4>
                    <p className="text-sm"><strong>Service:</strong> {selectedAppointmentDetails.service}</p>
                    <p className="text-sm"><strong>Date:</strong> {new Date(selectedAppointmentDetails.date).toLocaleDateString()}</p>
                    <p className="text-sm"><strong>Time:</strong> {selectedAppointmentDetails.time}</p>
                    <p className="text-sm"><strong>Vendor:</strong> {selectedAppointmentDetails.vendorName}</p>
                    <p className="text-sm"><strong>Token:</strong> #{formData.token}</p>
                  </div>
                )}

                <Input
                  label="Booking Token (if not selecting from above)"
                  name="token"
                  type="text"
                  value={formData.token}
                  onChange={handlePhoneChange}
                  placeholder="Enter your booking token number"
                  required={appointments.length === 0}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    className="bg-red-600 hover:bg-red-700"
                    isLoading={loading}
                    disabled={!formData.token && !formData.appointmentId || !formData.phone}
                  >
                    Request Cancellation
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    fullWidth
                    className="mt-3"
                    onClick={() => navigate('/search-appointments')}
                  >
                    Back to Search
                  </Button>
                </div>
              </form>

              <div className="text-center mt-8 text-sm">
                <p className="text-gray-600 mb-1">Need help? Contact our support team</p>
                <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800 font-medium">support@example.com</a>
                <span className="mx-2 text-gray-400">|</span>
                <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-800 font-medium">(123) 456-7890</a>
              </div>
            </Card>
          </div>
          
          {/* Right Column - Cancellation Policy */}
          <div>
            <Card className="shadow-lg border border-gray-100 bg-blue-50 h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cancellation Policy</h3>
                <p className="mt-2 text-gray-600">Please review our cancellation guidelines</p>
              </div>
              
              <div className="flex flex-col space-y-5 text-gray-700">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Free Cancellation Period</h4>
                    <p>You can cancel your appointment for free up to <strong>4 hours</strong> before the scheduled time without any penalty.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Late Cancellations</h4>
                    <p>Cancellations made less than 4 hours before the appointment will incur a <strong>30% cancellation fee</strong> of the service price.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">No-Shows</h4>
                    <p>If you don't show up for your appointment without cancelling, you will be charged the <strong>full amount</strong> of the scheduled service.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Confirmation Email</h4>
                    <p>You'll receive a confirmation email once your cancellation request has been processed with details of any applicable fees.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Multiple Cancellations</h4>
                    <p>Frequent cancellations may affect your ability to make future bookings with our service.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Special Circumstances</h4>
                    <p>In case of emergencies or special circumstances, please contact our customer support team directly to discuss your situation.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel your appointment? This action cannot be undone.</p>
            
            {selectedAppointmentDetails && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-800 mb-2">Appointment Details:</p>
                <p className="text-sm"><strong>Service:</strong> {selectedAppointmentDetails.service}</p>
                <p className="text-sm"><strong>Vendor:</strong> {selectedAppointmentDetails.vendorName}</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(selectedAppointmentDetails.date).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Time:</strong> {selectedAppointmentDetails.time}</p>
                <p className="text-sm"><strong>Token:</strong> #{formData.token}</p>
              </div>
            )}
            
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Go Back
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleConfirmCancel}
                isLoading={loading}
              >
                Yes, Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelAppointment;
