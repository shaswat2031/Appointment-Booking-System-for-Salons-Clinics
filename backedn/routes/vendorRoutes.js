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

// Add this route to your existing vendor routes
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password -tokensByDate -lastTokenNumber -lastTokenResetDate');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (err) {
    console.error('Error fetching vendor:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Also add a route to get vendor services
router.get('/:id/services', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('services');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Transform services to include IDs for frontend selection
    const services = vendor.services.map(service => ({
      id: service._id,
      name: service.name,
      duration: service.duration,
      price: service.price
    }));
    
    res.json(services);
  } catch (err) {
    console.error('Error fetching vendor services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
