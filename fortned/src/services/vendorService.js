import API from './api';
import axios from 'axios';

const API_URL = API.defaults.baseURL;

/**
 * Register a new vendor
 * @param {Object} vendorData - Vendor registration data
 */
export const registerVendor = (vendorData) => API.post('/vendors/register', vendorData);

/**
 * Login vendor
 * @param {Object} credentials - Login credentials
 */
export const loginVendor = (credentials) => API.post('/vendors/login', credentials);

/**
 * Get vendor bookings
 * @param {string} token - Auth token
 */
export const getVendorBookings = (token) => {
  return API.get('/vendors/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * Toggle vendor open status
 * @param {string} token - Auth token
 */
export const toggleOpenStatus = (token) => {
  return API.patch('/vendors/toggle-shop', {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * Update token number for a booking
 * @param {string} token - Auth token
 * @param {string} bookingId - Booking ID
 * @param {string} newToken - New token number
 */
export const updateTokenNumber = (token, bookingId, newToken) => {
  return axios.patch(`${API_URL}/vendor/bookings/${bookingId}/token`, 
    { token: newToken },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};

/**
 * Notify customer about queue
 * @param {string} token - Auth token
 * @param {string} bookingId - Booking ID
 */
export const notifyCustomerAboutQueue = async (token, bookingId) => {
  return axios.post(`/api/vendor/bookings/${bookingId}/notify-queue`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Reschedule a booking
 * @param {string} token - JWT token
 * @param {string} bookingId - Booking ID to reschedule
 * @param {string} newDate - New date for the booking
 * @param {string} newTime - New time for the booking
 */
export const rescheduleBooking = (token, bookingId, newDate, newTime) =>
  API.patch(`/bookings/${bookingId}/reschedule`, 
    { newDate, newTime }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );

/**
 * Update booking status
 * @param {string} token - JWT token
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status ('done', 'cancelled', etc.)
 */
export const updateBookingStatus = (token, bookingId, status) =>
  API.patch(`/bookings/${bookingId}/status`, 
    { status }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );

/**
 * Update booking completion status
 * @param {string} token - JWT token
 * @param {string} bookingId - Booking ID
 * @param {boolean} completed - Whether the booking is completed
 * @param {string} completedBy - Name of the person who completed the booking
 */
export const updateBookingCompleted = (token, bookingId, completed, completedBy = '') =>
  API.patch(`/bookings/${bookingId}/completed`, 
    { completed, completedBy }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
