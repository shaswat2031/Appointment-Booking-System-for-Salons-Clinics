const express = require('express');
const router = express.Router();
const { 
  getAllBookings, 
  getBookingById, 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  updateBookingStatus,
  updateBookingCompleted,
  updateEstimatedWaitTime,
  rescheduleBooking
} = require('../controllers/bookingController');
const { protectVendor } = require('../middleware/authMiddleware');

// GET all bookings
router.get('/', getAllBookings);

// GET booking by ID
router.get('/:id', getBookingById);

// POST new booking
router.post('/', createBooking);

// PUT/PATCH update booking
router.put('/:id', updateBooking);

// DELETE booking
router.delete('/:id', deleteBooking);

// PATCH update booking status
router.patch('/:bookingId/status', protectVendor, updateBookingStatus);

// PATCH update booking completed status
router.patch('/:bookingId/completed', protectVendor, updateBookingCompleted);

// PATCH update estimated wait time
router.patch('/:bookingId/wait-time', protectVendor, updateEstimatedWaitTime);

// PATCH reschedule booking
router.patch('/:bookingId/reschedule', protectVendor, rescheduleBooking);

module.exports = router;
