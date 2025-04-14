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
 * Get vendor bookings with optional caching
 * @param {string} token - JWT token 
 * @param {boolean} bypassCache - Whether to bypass the cache
 */
export const getVendorBookings = (token, bypassCache = false) => {
  // Use cache key with timestamp precision to 1 minute
  const cacheKey = `vendor_bookings_${Math.floor(Date.now() / 60000)}`;
  
  // Check cache if not bypassing
  if (!bypassCache) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return Promise.resolve(JSON.parse(cachedData));
    }
  }
  
  // Fix: Changed from /vendor/bookings to /vendors/bookings to match API pattern
  return axios.get(`${API_URL}/vendors/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    // Cache the result for 1 minute
    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  });
};

/**
 * Toggle vendor open status
 * @param {string} token - Auth token
 */
export const toggleOpenStatus = async (token) => {
  try {
    // Fix the URL path - remove the duplicate /api/ prefix
    const response = await axios.patch(`${API_URL}/vendors/toggle-status`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error toggling shop status:', error);
    throw error;
  }
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
  return axios.post(`${API_URL}/vendors/bookings/${bookingId}/notify-queue`, {}, {
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

/**
 * Update estimated wait time for a booking
 * @param {string} token - JWT token
 * @param {string} bookingId - Booking ID
 * @param {number} estimatedWaitTime - Estimated wait time in minutes
 */
export const updateEstimatedWaitTime = async (token, bookingId, estimatedWaitTime) => {
  try {
    const response = await axios.put(
      `${API_URL}/vendors/bookings/${bookingId}/wait-time`,
      { estimatedWaitTime },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating wait time:', error);
    throw error;
  }
};
