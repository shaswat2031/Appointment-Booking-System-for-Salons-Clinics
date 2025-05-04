// server/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    serviceName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    time: { type: String, required: true }, // e.g. "14:30"
    date: { type: String, required: true }, // e.g. "2025-04-11"
    token: { type: Number, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "done"],
      default: "booked",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: String,
      default: null,
    },
    estimatedWaitTime: {
      type: Number,
      default: 15, // Default wait time in minutes
    },
    notes: {
      type: String,
      default: "",
    },
    notificationsSent: {
      type: Array,
      default: [], // Track which notifications have been sent
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
