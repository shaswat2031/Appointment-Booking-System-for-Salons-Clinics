const Appointment = require("../models/Appointment");
const Booking = require("../models/Booking"); // Added Booking model
const asyncHandler = require("express-async-handler");

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { service, date, time, clientId, businessId, notes } = req.body;

  if (!service || !date || !time || !clientId || !businessId) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const appointment = await Appointment.create({
    service,
    date,
    time,
    client: clientId,
    business: businessId,
    status: "scheduled",
    notes: notes || "",
  });

  if (appointment) {
    res.status(201).json(appointment);
  } else {
    res.status(400);
    throw new Error("Invalid appointment data");
  }
});

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate("client", "name email phone")
    .populate("business", "name address");

  res.status(200).json(appointments);
});

// @desc    Get appointments by business ID
// @route   GET /api/appointments/business/:id
// @access  Private
const getBusinessAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ business: req.params.id })
    .populate("client", "name email phone")
    .sort({ date: 1, time: 1 });

  res.status(200).json(appointments);
});

// @desc    Get appointments by client ID
// @route   GET /api/appointments/client/:id
// @access  Private
const getClientAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ client: req.params.id })
    .populate("business", "name address")
    .sort({ date: -1, time: 1 });

  res.status(200).json(appointments);
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("client", "name email phone")
    .populate("business", "name address");

  if (appointment) {
    res.status(200).json(appointment);
  } else {
    res.status(404);
    throw new Error("Appointment not found");
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.service = req.body.service || appointment.service;
    appointment.date = req.body.date || appointment.date;
    appointment.time = req.body.time || appointment.time;
    appointment.status = req.body.status || appointment.status;
    appointment.notes = req.body.notes || appointment.notes;

    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } else {
    res.status(404);
    throw new Error("Appointment not found");
  }
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    await appointment.remove();
    res.status(200).json({ message: "Appointment removed" });
  } else {
    res.status(404);
    throw new Error("Appointment not found");
  }
});

// @desc    Change appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const changeAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.status = status;
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } else {
    res.status(404);
    throw new Error("Appointment not found");
  }
});

// @desc    Get available time slots for a specific date
// @route   GET /api/appointments/timeslots/:businessId/:date
// @access  Public
const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  const { businessId, date } = req.params;

  // Get all appointments for this business on this date
  const appointments = await Appointment.find({
    business: businessId,
    date: date,
  });

  // Extract booked times
  const bookedTimes = appointments.map((appointment) => appointment.time);

  // Generate all possible time slots (example: 9AM to 5PM, 30min intervals)
  const allTimeSlots = [];
  const startHour = 9; // 9AM
  const endHour = 17; // 5PM

  for (let hour = startHour; hour < endHour; hour++) {
    allTimeSlots.push(`${hour}:00`);
    allTimeSlots.push(`${hour}:30`);
  }

  // Filter out booked slots
  const availableSlots = allTimeSlots.filter(
    (slot) => !bookedTimes.includes(slot)
  );

  res.status(200).json(availableSlots);
});

// @desc    Search appointments by phone number
// @route   GET /api/public/search-by-phone/:phone
// @access  Public
const searchAppointmentsByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  // Standardize phone number format by removing non-digits
  const standardizedPhone = phone.replace(/\D/g, "");

  // Validate phone number format
  if (
    standardizedPhone.length !== 10 &&
    (standardizedPhone.length < 11 || standardizedPhone.length > 14)
  ) {
    res.status(400);
    throw new Error(
      "Please provide a valid phone number (10 digits or international format)"
    );
  }

  // Get current date to filter only upcoming appointments
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to beginning of today

  try {
    // Find appointments with flexible phone number matching (both exact and ending with the provided number)
    const appointments = await Booking.find({
      $or: [
        { customerPhone: standardizedPhone },
        { customerPhone: { $regex: standardizedPhone + "$" } }, // Match phone numbers ending with the provided digits
      ],
      status: { $nin: ["cancelled", "done"] }, // Exclude cancelled and completed appointments
      $or: [
        { date: { $gt: currentDate.toISOString().split("T")[0] } }, // Future dates
        {
          date: currentDate.toISOString().split("T")[0], // Today's date
          time: { $gte: new Date().toTimeString().slice(0, 5) }, // Current or future time
        },
      ],
    })
      .sort({ date: 1, time: 1 })
      .populate("vendor", "name category");

    res.status(200).json({
      success: true,
      appointments: appointments.map((apt) => ({
        id: apt._id,
        service: apt.serviceName,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        token: apt.token,
        vendorId: apt.vendor._id,
        vendorName: apt.vendor.name,
        vendorCategory: apt.vendor.category,
      })),
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Error searching appointments: ${error.message}`);
  }
});

// @desc    Cancel appointment by public user
// @route   POST /api/public/cancel-appointment
// @access  Public
const cancelAppointment = asyncHandler(async (req, res) => {
  const { phone, token, bookingId } = req.body;

  let appointment;

  if (bookingId) {
    appointment = await Booking.findById(bookingId);
  } else if (phone && token) {
    appointment = await Booking.findOne({ customerPhone: phone, token });
  } else {
    res.status(400);
    throw new Error("Either booking ID or both phone and token are required");
  }

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "booked") {
    res.status(400);
    throw new Error(
      `Cannot cancel appointment with status '${appointment.status}'`
    );
  }

  appointment.status = "cancelled";
  const updatedAppointment = await appointment.save();

  res.status(200).json({
    message: "Appointment cancelled successfully",
    id: updatedAppointment._id,
  });
});

module.exports = {
  createAppointment,
  getAppointments,
  getBusinessAppointments,
  getClientAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  changeAppointmentStatus,
  getAvailableTimeSlots,
  searchAppointmentsByPhone,
  cancelAppointment,
};
