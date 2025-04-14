// server/models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  phoneNumber: { type: String }, // Added for the business phone
  email: { type: String, unique: true },
  password: { type: String }, // hashed
  category: { type: String }, // e.g., barber, clinic
  location: { type: String },
  description: { type: String, default: '' }, // Added for business description
  isOpen: { type: Boolean, default: true },
  lastTokenNumber: { type: Number, default: 0 }, // Track last token number issued
  lastTokenResetDate: { type: String, default: null }, // Store the date when tokens were last reset

  // New field to store token counters by date
  tokensByDate: {
    type: Map,  
    of: Number,
    default: {}
  },

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
