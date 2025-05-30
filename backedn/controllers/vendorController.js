// server/controllers/vendorController.js
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Register Vendor
const registerVendor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      category, 
      location, 
      services,
      description,
      phoneNumber,
      openingTime,
      closingTime 
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      name,
      email,
      password: hashedPassword,
      category,
      location,
      services: services || [],
      description: description || '',
      phoneNumber: phoneNumber || '',
      workingHours: {
        start: openingTime || '09:00',
        end: closingTime || '18:00'
      },
      isOpen: true // Set default status to open
    });

    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      token, 
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        category: vendor.category,
        isOpen: vendor.isOpen
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// 🔐 Login Vendor
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        category: vendor.category,
        isOpen: vendor.isOpen
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 📅 Get All Bookings for Vendor
const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user._id; // Use _id since that's what's in the database
    
    // Get vendor info
    const vendor = await Vendor.findById(vendorId).select('-password');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Add query parameters support for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Get the bookings - include status filter if provided
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const dateFilter = req.query.date ? { date: req.query.date } : {};
    
    // Create query with filters
    const query = { 
      vendor: vendorId,
      ...statusFilter,
      ...dateFilter
    };
    
    // Execute query with pagination
    const bookings = await Booking.find(query)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCount = await Booking.countDocuments(query);
    
    // Return both vendor and bookings data with pagination info
    res.json({
      vendor,
      bookings,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: page * limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

// ✅ Toggle Open/Closed Status
const toggleOpenStatus = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Toggle the isOpen status
    vendor.isOpen = !vendor.isOpen;
    await vendor.save();

    // Return clear message with new status
    res.json({ 
      message: `Shop is now ${vendor.isOpen ? 'Open' : 'Closed'}`,
      isOpen: vendor.isOpen
    });
  } catch (error) {
    console.error('Error toggling shop status:', error);
    res.status(500).json({ 
      message: 'Failed to update shop status',
      error: error.message 
    });
  }
};

// Get all vendors (public) - new function for frontend integration
const getAllVendors = async (req, res) => {
  try {
    // Allow filtering by isOpen status via query parameter
    const filter = req.query.showAll === 'true' ? {} : { isOpen: true };
    
    const vendors = await Vendor.find(filter)
      .select('-password')
      .sort({ name: 1 });
      
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  getVendorBookings,
  toggleOpenStatus,
  getAllVendors
};
