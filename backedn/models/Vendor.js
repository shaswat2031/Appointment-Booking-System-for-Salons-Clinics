// server/models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, unique: true },
  password: { type: String }, // hashed
  category: { type: String }, // e.g., barber, clinic
  location: { type: String },
  isOpen: { type: Boolean, default: true },

  services: [{
    name: String,
    duration: Number, // in minutes
    price: Number,
  }],

  workingHours: {
    start: String, // e.g. "09:00"
    end: String    // e.g. "18:00"
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
