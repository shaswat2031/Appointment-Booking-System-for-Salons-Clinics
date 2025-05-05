// server/controllers/bookingController.js
const Booking = require("../models/Booking");

// API base URL
const API_URL =
  "https://appointment-booking-system-for-salons-br4o.onrender.com";

// ✅ Mark Booking as Done or Cancelled
const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body; // 'done' or 'cancelled'

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.status = status;
  await booking.save();

  res.json({ message: `Booking marked as ${status}` });
};

// ✅ Update Booking Completed Status
const updateBookingCompleted = async (req, res) => {
  const { bookingId } = req.params;
  const { completed } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.completed = completed;

    // Track who completed the booking
    if (completed) {
      booking.completedBy = req.user.name || "Staff";
    } else {
      booking.completedBy = null;
    }

    await booking.save();

    res.json({
      message: "Booking completion status updated",
      booking,
      completedBy: booking.completedBy,
    });
  } catch (error) {
    console.error("Error updating booking completion status:", error);
    res.status(500).json({
      message: "Failed to update booking completion status",
      error: error.message,
    });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking" });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating booking", error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating booking", error: error.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking" });
  }
};

// New function to update estimated wait time
const updateEstimatedWaitTime = async (req, res) => {
  const { bookingId } = req.params;
  const { estimatedWaitTime } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.estimatedWaitTime = estimatedWaitTime;
    await booking.save();

    res.json({
      message: "Estimated wait time updated",
      booking,
    });
  } catch (error) {
    console.error("Error updating wait time:", error);
    res
      .status(500)
      .json({ message: "Failed to update wait time", error: error.message });
  }
};

// Update token number function to consider dates
const updateTokenNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    if (!token || isNaN(token) || token < 1) {
      return res
        .status(400)
        .json({ message: "Valid token number is required" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the vendor owns this booking
    if (booking.vendor.toString() !== req.vendor.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    // Format booking date for consistency
    const bookingDateStr = new Date(booking.date).toISOString().split("T")[0];

    // Check if the token is already in use by this vendor on the same date
    const existingWithToken = await Booking.findOne({
      vendor: booking.vendor,
      date: bookingDateStr,
      token: token,
      _id: { $ne: id }, // Exclude the current booking
    });

    if (existingWithToken) {
      return res.status(400).json({
        message:
          "Token number already in use by another booking on the same date. Please choose a different number.",
      });
    }

    // Update vendor's token counter for this date if needed
    const vendor = await Vendor.findById(booking.vendor);
    if (!vendor.tokensByDate) {
      vendor.tokensByDate = {};
    }

    if (
      !vendor.tokensByDate[bookingDateStr] ||
      token > vendor.tokensByDate[bookingDateStr]
    ) {
      vendor.tokensByDate[bookingDateStr] = token;
      await vendor.save();
    }

    booking.token = token;
    await booking.save();

    res.json({ message: "Token updated successfully", booking });
  } catch (error) {
    console.error("Error updating token number:", error);
    res
      .status(500)
      .json({ message: "Failed to update token number", error: error.message });
  }
};

// Notify customer about queue position and estimated wait time
const notifyCustomerAboutQueue = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "vendor",
      "name"
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the vendor owns this booking
    if (booking.vendor.toString() !== req.vendor.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    // Count how many bookings are ahead
    const bookingsAhead = await Booking.countDocuments({
      vendor: booking.vendor._id,
      date: booking.date,
      token: { $lt: booking.token },
      status: "booked",
      completed: false,
    });

    // Calculate estimated wait time
    const estimatedWaitingTime = booking.estimatedWaitTime
      ? booking.estimatedWaitTime * bookingsAhead
      : 15 * bookingsAhead; // Default 15 min per booking

    // Send notification to customer
    try {
      await sendStatusUpdateSMS({
        to: booking.customerPhone,
        vendorName: booking.vendor.name,
        position: bookingsAhead + 1,
        waitTime: estimatedWaitingTime,
        token: booking.token,
      });
    } catch (smsError) {
      console.error("SMS notification error:", smsError);
      return res.status(500).json({
        message: "Failed to send notification to customer",
        error: smsError.message,
      });
    }

    res.json({
      message: "Customer notified about queue position",
      queueInfo: {
        position: bookingsAhead + 1,
        estimatedWaitingTime,
        token: booking.token,
      },
    });
  } catch (error) {
    console.error("Error notifying customer:", error);
    res
      .status(500)
      .json({ message: "Failed to notify customer", error: error.message });
  }
};

// Reschedule booking
const rescheduleBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { newDate, newTime } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the vendor owns this booking
    if (booking.vendor.toString() !== req.vendor.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to reschedule this booking" });
    }

    // Update the booking with new date and time
    booking.date = newDate;
    booking.time = newTime;
    await booking.save();

    // Try to notify the customer via SMS
    try {
      await sendStatusUpdateSMS({
        to: booking.customerPhone,
        vendorName: req.vendor.name,
        message: `Your appointment has been rescheduled to ${newDate} at ${newTime}. Token #${booking.token}.`,
      });
    } catch (smsError) {
      console.error("SMS notification error:", smsError);
    }

    res.json({
      message: "Booking rescheduled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res
      .status(500)
      .json({ message: "Failed to reschedule booking", error: error.message });
  }
};

module.exports = {
  updateBookingStatus,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingCompleted,
  updateEstimatedWaitTime,
  updateTokenNumber,
  notifyCustomerAboutQueue,
  rescheduleBooking,
};
