const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Get bookings by phone number
router.get("/user/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const bookings = await Booking.find({ phoneNumber })
      .populate("service")
      .sort({ appointmentDate: 1 });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this phone number" });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel a booking
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
