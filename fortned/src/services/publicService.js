import API from "./api";

/**
 * Book a new appointment
 * @param {Object} data - Booking details (vendorId, phone, serviceName, time, date)
 */
export const bookAppointment = (data) => API.post("/public/book", data);

/**
 * Cancel an existing appointment
 * @param {Object} appointmentData - Cancellation details
 */
export const cancelAppointment = (appointmentData) =>
  API.post("/public/cancel", appointmentData);

/**
 * Get list of available vendors
 * @param {boolean} showAll - Whether to show all vendors or only open ones
 */
export const getVendors = (showAll = false) =>
  API.get(`/vendors${showAll ? "?showAll=true" : ""}`);

/**
 * Check booking status by phone and token
 * @param {string} phone - Customer phone number
 * @param {string} token - Booking token
 */
export const checkBookingStatus = (phone, token) =>
  API.get(`/public/booking-status?phone=${phone}&token=${token}`);

/**
 * Check booking status by ID or email
 * @param {Object} params - Search parameters (id or email)
 */
export const checkBookingStatusByQuery = (params) =>
  API.get("/public/booking-status", { params });

/**
 * Search appointments by phone number
 * @param {string} phone - Customer phone number
 */
export const searchAppointmentsByPhone = (phone) => {
  // Standardize phone format by removing non-digit characters
  const standardizedPhone = phone.replace(/\D/g, "");

  // Validate phone number format
  if (
    standardizedPhone.length !== 10 &&
    (standardizedPhone.length < 11 || standardizedPhone.length > 14)
  ) {
    return Promise.reject(new Error("Please provide a valid phone number"));
  }

  return API.get(`/public/search-by-phone/${standardizedPhone}`);
};
