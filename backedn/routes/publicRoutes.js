// server/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  cancelAppointment, 
  getBookingQueueStatus,
  getBookingStatus
} = require('../controllers/publicController');
const appointmentController = require('../controllers/appointmentController');

// POST /api/public/book
router.post('/book', bookAppointment);

// POST /api/public/cancel
router.post('/cancel', cancelAppointment);

// GET /api/public/queue
router.get('/queue', getBookingQueueStatus);

// GET /api/public/booking-status
router.get('/booking-status', getBookingStatus);

// Route for searching appointments by phone number
router.get('/search-by-phone/:phone', appointmentController.searchAppointmentsByPhone);

// Route for cancelling appointments
router.post('/cancel-appointment', appointmentController.cancelAppointment);

module.exports = router;