import React, { useState } from 'react';
import { checkBookingStatus } from '../services/publicService';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

const BookingStatus = () => {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);
    
    try {
      const response = await checkBookingStatus(phone, token);
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find your booking. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'text-blue-700';
      case 'cancelled':
        return 'text-red-700';
      case 'done':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  const validatePhone = (value) => {
    // Allow only numbers and basic formatting characters
    return value.replace(/[^\d+\s()-]/g, '');
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Check Your Booking Status</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(validatePhone(e.target.value))}
          placeholder="Enter your 10-digit phone number"
          pattern="[0-9+\s()-]+"
          className="focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <Input
          label="Booking Token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token number provided during booking"
          className="focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <Button 
          type="submit" 
          isLoading={loading}
        >
          Check Status
        </Button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {booking && (
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <h4 className="font-medium mb-2">Booking Details</h4>
          <p><span className="font-medium">Service:</span> {booking.serviceName}</p>
          <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
          <p><span className="font-medium">Time:</span> {booking.time}</p>
          <p><span className="font-medium">Token:</span> #{booking.token}</p>
          <p>
            <span className="font-medium">Status:</span> 
            <span className={`ml-1 capitalize ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </p>
          <p><span className="font-medium">Vendor:</span> {booking.vendorName}</p>
          
          {/* Display queue position if status is 'booked' */}
          {booking.status === 'booked' && !booking.completed && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded">
              <p className="font-medium text-blue-700">Queue Position: {booking.position}</p>
              {booking.waitingTime !== undefined && (
                <p className="text-blue-700">Estimated Wait: {booking.waitingTime} minutes</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          )}
          
          {/* Show completed by information if booking is done */}
          {booking.status === 'done' && booking.completedBy && (
            <p className="mt-2"><span className="font-medium">Completed by:</span> {booking.completedBy}</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default BookingStatus;
