// server/controllers/publicController.js
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const Appointment = require('../models/Appointment');
const { generateNextToken } = require('../utils/generateToken');
const { 
  sendBookingSMS, 
  sendCancellationSMS,
  sendStatusUpdateSMS 
} = require('../utils/smsHelper');

const bookAppointment = async (req, res) => {
  try {
    const { vendorId, phone: customerPhone, customerName, serviceName, time, date, customerEmail, notes } = req.body;

    if (!vendorId || !customerPhone || !serviceName || !time || !date || !customerName) {
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

    // Generate next token number for this vendor for the specific date
    const nextToken = await generateNextToken(vendorId, date, Booking);

    // Save booking
    const booking = new Booking({
      vendor: vendorId,
      customerPhone,
      customerName, // Save the customer name
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

// Cancel appointment with time restriction and improved performance
const cancelAppointment = async (req, res) => {
  try {
    const { token, phone, appointmentId } = req.body;
    
    let appointment;
    let queryStartTime = Date.now();
    
    // Use more efficient query approach
    if (appointmentId) {
      appointment = await Booking.findById(appointmentId).populate('vendor', 'name');
    } else if (token && phone) {
      // Create index for this query pattern in your MongoDB setup
      appointment = await Booking.findOne({ token, customerPhone: phone }).populate('vendor', 'name');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Either appointment ID or both token and phone are required' 
      });
    }
    
    console.log(`Query execution time: ${Date.now() - queryStartTime}ms`);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found. Please check your details.' 
      });
    }

    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled.'
      });
    }
    
    // Check if appointment is within 4 hours (as per cancellation policy)
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const currentTime = new Date();
    const timeDiff = appointmentDateTime - currentTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    let cancellationFee = 0;
    if (hoursDiff < 4) {
      // Set cancellation fee flag but still allow cancellation
      cancellationFee = 30; // 30% fee for late cancellation
    }
    
    // Update appointment status - use more efficient direct update
    const updateStartTime = Date.now();
    await Booking.updateOne(
      { _id: appointment._id },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );
    
    console.log(`Update execution time: ${Date.now() - updateStartTime}ms`);
    
    // Send cancellation SMS if we have the vendor name
    try {
      if (appointment.customerPhone && appointment.vendor?.name) {
        await sendCancellationSMS({
          to: appointment.customerPhone,
          vendorName: appointment.vendor.name,
          time: appointment.time,
          date: appointment.date,
          token: appointment.token
        });
      }
    } catch (smsError) {
      console.error('Failed to send cancellation SMS:', smsError);
      // Continue with the response even if SMS fails
    }
    
    res.json({
      success: true,
      message: hoursDiff < 4 
        ? `Your appointment has been cancelled. Note: a ${cancellationFee}% cancellation fee applies for late cancellations.`
        : 'Your appointment has been successfully cancelled.',
      cancellationFee: hoursDiff < 4 ? cancellationFee : 0
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment. Please try again.'
    });
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
    
    // Find all appointments for this phone number
    const appointments = await Booking.find({ 
      customerPhone: phone
    }).sort({ date: 1, time: 1 }).populate('vendor', 'name category');
    
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
        vendorName: apt.vendor ? apt.vendor.name : 'Unknown',
        vendorId: apt.vendor ? apt.vendor._id : null,
        vendorCategory: apt.vendor ? apt.vendor.category : null,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone
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

module.exports = {
  bookAppointment,
  cancelAppointment,
  getBookingQueueStatus,
  getBookingStatus,
  searchAppointmentsByPhone
};
