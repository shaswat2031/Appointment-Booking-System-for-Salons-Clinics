// src/pages/VendorDashboard.jsx
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import React from 'react';
import { getVendorBookings, toggleOpenStatus, updateBookingStatus, rescheduleBooking, updateBookingCompleted, updateTokenNumber } from '../services/vendorService';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [completedByVendor, setCompletedByVendor] = useState('');
  const [showNextClient, setShowNextClient] = useState(false);
  const [nextClient, setNextClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const [bookingToUpdateToken, setBookingToUpdateToken] = useState(null);
  const [newTokenNumber, setNewTokenNumber] = useState('');
  const token = localStorage.getItem('vendorToken');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setError('');
      const res = await getVendorBookings(token);
      setBookings(res.data.bookings || []);
      setFilteredBookings(res.data.bookings || []);
      setVendor(res.data.vendor || {});
      
      const nextClientBooking = (res.data.bookings || []).find(b => 
        b.status === 'booked' && !b.completed
      );
      
      if (nextClientBooking) {
        setNextClient(nextClientBooking);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err.message);
      setError('Failed to fetch bookings. Please try again later.');

      if (err.response && err.response.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendor/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookings.length === 0) return;
    
    if (filterStatus === 'all') {
      setFilteredBookings(bookings);
    } else if (filterStatus === 'pending') {
      setFilteredBookings(bookings.filter(b => b.status === 'booked' && !b.completed));
    } else if (filterStatus === 'completed') {
      setFilteredBookings(bookings.filter(b => b.status === 'done' || b.completed));
    }
  }, [filterStatus, bookings]);

  const handleToggleShop = async () => {
    setToggleLoading(true);
    try {
      setError(null);
      const res = await toggleOpenStatus(token);
      setVendor(prev => ({ ...prev, isOpen: res.data.isOpen }));
      fetchBookings();
    } catch (err) {
      console.error('Toggle failed', err);
      setError('Failed to update shop status. Please try again.');

      if (err.response && err.response.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendor/login');
      }
    } finally {
      setToggleLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status, completedBy = '') => {
    setActionLoading(prev => ({ ...prev, [bookingId]: status }));
    try {
      setError(null);
      await updateBookingStatus(token, bookingId, status);

      if (status === 'done' && completedBy) {
        await updateBookingCompleted(token, bookingId, true, completedBy);
      }

      await fetchBookings();

      if (status === 'done') {
        const updatedBookings = await getVendorBookings(token);
        const bookedAppointments = updatedBookings.data.bookings.filter(b =>
          b.status === 'booked' && !b.completed
        ).sort((a, b) => {
          const dateComparison = new Date(a.date) - new Date(b.date);
          if (dateComparison !== 0) return dateComparison;
          return a.time.localeCompare(b.time);
        });

        if (bookedAppointments.length > 0) {
          setNextClient(bookedAppointments[0]);
          setShowNextClient(true);
        }
      }
    } catch (err) {
      console.error(`Failed to change status to ${status}`, err);
      setError(`Failed to update appointment status. Please try again.`);

      if (err.response && err.response.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendor/login');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleCompleteWithVendor = (bookingId) => {
    const vendorName = completedByVendor || vendor?.name || 'Staff';
    handleStatusChange(bookingId, 'done', vendorName);
  };

  const handleRescheduleClick = (booking) => {
    setReschedulingBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking) return;

    setActionLoading(prev => ({ ...prev, [reschedulingBooking._id]: 'reschedule' }));
    try {
      setError(null);
      await rescheduleBooking(token, reschedulingBooking._id, newDate, newTime);
      setReschedulingBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Failed to reschedule', err);
      setError('Failed to reschedule appointment. Please try again.');

      if (err.response && err.response.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendor/login');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [reschedulingBooking._id]: null }));
    }
  };

  const cancelReschedule = () => {
    setReschedulingBooking(null);
  };

  const closeNextClientNotification = () => {
    setShowNextClient(false);
    setNextClient(null);
  };

  const openTokenUpdate = (booking) => {
    setBookingToUpdateToken(booking);
    setNewTokenNumber(booking.token);
    setIsUpdatingToken(true);
  };

  const handleTokenUpdate = async () => {
    if (!bookingToUpdateToken) return;
    
    setActionLoading(prev => ({ ...prev, [bookingToUpdateToken._id]: 'token' }));
    try {
      await updateTokenNumber(token, bookingToUpdateToken._id, newTokenNumber);
      setIsUpdatingToken(false);
      setBookingToUpdateToken(null);
      setNewTokenNumber('');
      await fetchBookings();
    } catch (err) {
      console.error('Failed to update token number', err);
      setError('Failed to update token number. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingToUpdateToken._id]: null }));
    }
  };

  const cancelTokenUpdate = () => {
    setIsUpdatingToken(false);
    setBookingToUpdateToken(null);
    setNewTokenNumber('');
  };

  useEffect(() => {
    if (!token) {
      navigate('/vendor/login');
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        {nextClient && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Now Serving</h2>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white text-4xl font-bold rounded-lg w-24 h-24 flex items-center justify-center shadow-md">
                  #{nextClient.token}
                </div>
                <div className="ml-6">
                  <p className="text-lg"><strong>Phone:</strong> {nextClient.customerPhone}</p>
                  <p><strong>Service:</strong> {nextClient.serviceName}</p>
                  <p><strong>Time:</strong> {nextClient.time}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCompleteWithVendor(nextClient._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  disabled={actionLoading[nextClient._id]}
                >
                  {actionLoading[nextClient._id] ? 'Processing...' : 'Complete'}
                </button>
                <button
                  onClick={() => openTokenUpdate(nextClient)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Update Token
                </button>
              </div>
            </div>
          </div>
        )}

        {showNextClient && nextClient && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md shadow-md animate-pulse">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-green-800">Next Client Ready!</h3>
                <p className="text-green-700"><strong>Token:</strong> #{nextClient.token}</p>
                <p className="text-green-700"><strong>Phone:</strong> {nextClient.customerPhone}</p>
                <p className="text-green-700"><strong>Service:</strong> {nextClient.serviceName}</p>
                <p className="text-green-700"><strong>Time:</strong> {nextClient.time}</p>
              </div>
              <button 
                onClick={closeNextClientNotification}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {vendor && (
          <div className="mb-6 bg-white p-4 rounded shadow border border-gray-200">
            <p><strong>Name:</strong> {vendor.name}</p>
            <p><strong>Email:</strong> {vendor.email}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`font-medium ${vendor.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {vendor.isOpen ? 'Open' : 'Closed'}
              </span>
              <button
                className={`ml-4 px-3 py-1 rounded ${toggleLoading ? 'bg-gray-400' : vendor.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition`}
                onClick={handleToggleShop}
                disabled={toggleLoading}
              >
                {toggleLoading 
                  ? 'Updating...' 
                  : vendor.isOpen ? 'Close Shop' : 'Open Shop'
                }
              </button>
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <div className="flex gap-2 items-center">
            <div className="flex bg-gray-100 rounded-lg overflow-hidden">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-sm ${filterStatus === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 text-sm ${filterStatus === 'pending' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1 text-sm ${filterStatus === 'completed' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'}`}
              >
                Completed
              </button>
            </div>
            <input
              type="text"
              placeholder="Completed by (your name)"
              value={completedByVendor}
              onChange={(e) => setCompletedByVendor(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">No bookings to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map(booking => (
              <div key={booking._id} className={`p-4 border rounded-lg shadow-sm transition ${booking.status === 'booked' && !booking.completed ? 'bg-white' : booking.status === 'done' ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <p><strong className="inline-block w-20">Phone:</strong> {booking.customerPhone}</p>
                    <p><strong className="inline-block w-20">Service:</strong> {booking.serviceName}</p>
                    <p><strong className="inline-block w-20">Date:</strong> {booking.date}</p>
                    <p><strong className="inline-block w-20">Time:</strong> {booking.time}</p>
                    <p>
                      <strong className="inline-block w-20">Token:</strong> 
                      <span className="font-bold text-blue-700">#{booking.token}</span>
                      <button
                        onClick={() => openTokenUpdate(booking)}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                    </p>
                    <p>
                      <strong className="inline-block w-20">Status:</strong>{' '}
                      <span className={`capitalize font-medium px-2 py-0.5 rounded-full text-xs ${
                        booking.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                        booking.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </p>
                    {booking.completedBy && (
                      <p><strong className="inline-block w-20">Done by:</strong> {booking.completedBy}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {booking.status === 'booked' && (
                      <>
                        <button 
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1 min-w-[120px]"
                          onClick={() => handleCompleteWithVendor(booking._id)}
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === 'done' ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark Complete
                            </>
                          )}
                        </button>
                        <button 
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                          onClick={() => handleRescheduleClick(booking)}
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === 'reschedule' ? 'Processing...' : 'Reschedule'}
                        </button>
                        <button 
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                          onClick={() => handleStatusChange(booking._id, 'cancelled')}
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === 'cancelled' ? 'Processing...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {booking.status === 'done' && (
                      <button 
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                        onClick={() => handleStatusChange(booking._id, 'booked')}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] === 'booked' ? 'Processing...' : 'Mark as Pending'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reschedulingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Reschedule Appointment</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={cancelReschedule}
                  disabled={actionLoading[reschedulingBooking._id]}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleRescheduleSubmit}
                  disabled={actionLoading[reschedulingBooking._id]}
                >
                  {actionLoading[reschedulingBooking._id] ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isUpdatingToken && bookingToUpdateToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Update Token Number</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Token Number
                </label>
                <input
                  type="number"
                  value={newTokenNumber}
                  onChange={(e) => setNewTokenNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={cancelTokenUpdate}
                  disabled={actionLoading[bookingToUpdateToken._id]}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleTokenUpdate}
                  disabled={actionLoading[bookingToUpdateToken._id]}
                >
                  {actionLoading[bookingToUpdateToken._id] ? 'Saving...' : 'Update Token'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VendorDashboard;
