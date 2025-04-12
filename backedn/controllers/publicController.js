// server/controllers/publicController.js
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const Appointment = require('../models/Appointment');
const { 
  sendBookingSMS, 
  sendCancellationSMS,
  sendStatusUpdateSMS 
} = require('../utils/smsHelper');

const bookAppointment = async (req, res) => {
  try {
    const { vendorId, phone: customerPhone, serviceName, time, date, customerName, customerEmail, notes } = req.body;

    if (!vendorId || !customerPhone || !serviceName || !time || !date) {
      return res.status(400).json({ message: 'Required fields missing. Please fill all mandatory fields.' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });
    
    // Check if vendor is open - Enforce this check
    if (!vendor.isOpen) {
      return res.status(400).json({ 
        message: 'This vendor is currently not accepting appointments.',
        isOpen: false
      });
    }

    // Validate phone number format (basic validation)
    if (!customerPhone.match(/^\+?[0-9]{10,14}$/)) {
      return res.status(400).json({ message: 'Invalid phone number format. Please enter a valid phone number.' });
    }

    // Count how many bookings already exist for that vendor on that date
    const existingBookings = await Booking.find({ vendor: vendorId, date });

    // Assign next token number
    const nextToken = existingBookings.length + 1;

    // Save booking
    const booking = new Booking({
      vendor: vendorId,
      customerPhone,
      customerName,
      customerEmail,
      serviceName,
      time,
      date,
      token: nextToken,
      notes
    });

    await booking.save();

    // Send SMS confirmation if SMS service is properly configured
    try {
      await sendBookingSMS({
        to: customerPhone,
        vendorName: vendor.name,
        serviceName,
        time,
        date,
        token: nextToken
      });
    } catch (smsError) {
      console.error("SMS error:", smsError);
      // Continue with booking even if SMS fails
    }

    res.status(201).json({
      message: 'Booking successful!',
      token: nextToken,
      time,
      date,
      vendorName: vendor.name,
      bookingId: booking._id,
      createdAt: booking.createdAt
    });

  } catch (error) {
    console.error('Booking Error:', error.message);
    res.status(500).json({ message: 'Something went wrong while booking.', error: error.message });
  }
};

// Add missing cancelAppointment implementation
const cancelAppointment = async (req, res) => {
  try {
    const { phone, token } = req.body;
    
    if (!phone || !token) {
      return res.status(400).json({ message: 'Phone and token are required' });
    }
    
    // Find the booking
    const booking = await Booking.findOne({
      customerPhone: phone,
      token: token
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found with the provided details' });
    }
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Appointment cancelled successfully', bookingId: booking._id });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error during cancellation' });
  }
};

// Get booking queue status
const getBookingQueueStatus = async (req, res) => {
  try {
    const { phone, token, date } = req.query;
    
    if (!phone || !token) {
      return res.status(400).json({ message: 'Phone and token are required' });
    }
    
    // Find the booking
    const booking = await Booking.findOne({
      customerPhone: phone,
      token: token,
      date: date || new Date().toISOString().split('T')[0]
    }).populate('vendor', 'name isOpen');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Count how many bookings are ahead
    const bookingsAhead = await Booking.countDocuments({
      vendor: booking.vendor._id,
      date: booking.date,
      token: { $lt: booking.token },
      status: 'booked',
      completed: false
    });
    
    // Calculate estimated wait time
    const estimatedWaitingTime = booking.estimatedWaitTime 
      ? booking.estimatedWaitTime * bookingsAhead
      : 15 * bookingsAhead; // Default 15 min per booking
    
    res.json({
      booking: {
        token: booking.token,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        completed: booking.completed,
        completedBy: booking.completedBy,
        serviceName: booking.serviceName,
        vendorName: booking.vendor.name,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        estimatedWaitTime: booking.estimatedWaitTime,
        createdAt: booking.createdAt
      },
      queueStatus: {
        position: bookingsAhead + 1,
        bookingsAhead,
        estimatedWaitingTime,
        lastUpdated: new Date()
      }
    });
    
  } catch (error) {
    console.error('Queue Status Error:', error.message);
    res.status(500).json({ message: 'Something went wrong while checking queue status', error: error.message });
  }
};

// Get booking status by email or ID
const getBookingStatus = async (req, res) => {
  try {
    const { email, id } = req.query;
    
    if (!email && !id) {
      return res.status(400).json({ message: 'Either email or booking ID is required' });
    }
    
    let booking;
    
    if (id) {
      booking = await Booking.findById(id).populate('vendor', 'name isOpen');
    } else {
      booking = await Booking.findOne({ customerEmail: email }).sort({ createdAt: -1 }).populate('vendor', 'name isOpen');
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'No booking found with the provided details' });
    }
    
    // Count how many bookings are ahead
    const bookingsAhead = await Booking.countDocuments({
      vendor: booking.vendor._id,
      date: booking.date,
      token: { $lt: booking.token },
      status: 'booked',
      completed: false
    });
    
    res.json({
      id: booking._id,
      token: booking.token,
      date: booking.date,
      time: booking.time,
      service: booking.serviceName,
      clientName: booking.customerName || "Client",
      status: booking.status,
      vendor: booking.vendor.name,
      position: booking.status === 'booked' ? bookingsAhead + 1 : null,
      estimatedWaitTime: booking.status === 'booked' ? booking.estimatedWaitTime * bookingsAhead : 0
    });
    
  } catch (error) {
    console.error('Booking Status Error:', error.message);
    res.status(500).json({ message: 'Error retrieving booking status', error: error.message });
  }
};

// Search appointments by phone number
const searchAppointmentsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }
    
    // Find all non-cancelled appointments for this phone number
    const appointments = await Booking.find({ 
      customerPhone: phone,
      status: { $ne: 'cancelled' }
    }).sort({ date: 1, time: 1 }).populate('vendor', 'name');
    
    if (appointments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No appointments found for this phone number.' 
      });
    }
    
    res.json({ 
      success: true, 
      appointments: appointments.map(apt => ({
        id: apt._id,
        date: apt.date,
        time: apt.time,
        service: apt.serviceName,
        token: apt.token,
        status: apt.status || 'booked',
        vendorName: apt.vendor ? apt.vendor.name : 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Error searching appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search appointments. Please try again.' 
    });
  }
};

// Cancel appointment with time restriction
const cancelAppointmentWithRestriction = async (req, res) => {
  try {
    const { token, phone } = req.body;
    
    const appointment = await Appointment.findOne({ token, phone });
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found. Please check your details.' 
      });
    }
    
    // Check if appointment is within 4 hours (as per cancellation policy)
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const currentTime = new Date();
    const timeDiff = appointmentDateTime - currentTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 4) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be cancelled at least 4 hours before the scheduled time.'
      });
    }
    
    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();
    
    // Here you could also add notification logic (SMS/email)
    
    res.json({
      success: true,
      message: 'Your appointment has been successfully cancelled.'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment. Please try again.'
    });
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  getBookingQueueStatus,
  getBookingStatus,
  searchAppointmentsByPhone,
  cancelAppointmentWithRestriction
};
