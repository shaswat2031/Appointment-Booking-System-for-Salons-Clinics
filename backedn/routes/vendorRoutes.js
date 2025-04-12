// server/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getVendorBookings,
  toggleOpenStatus,
  getAllVendors
} = require('../controllers/vendorController');
const bookingController = require('../controllers/bookingController'); // Add this line to import booking controller

const { protectVendor } = require('../middleware/authMiddleware');

// Public
router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.get('/', getAllVendors); // New route to get all vendors

// Protected
router.get('/bookings', protectVendor, getVendorBookings);
router.patch('/toggle-shop', protectVendor, toggleOpenStatus);
router.patch('/bookings/:id/token', protectVendor, bookingController.updateTokenNumber); // Fixed line

// Add route to notify customer about queue position
router.post('/bookings/:bookingId/notify-queue', protectVendor, bookingController.notifyCustomerAboutQueue);

module.exports = router;
