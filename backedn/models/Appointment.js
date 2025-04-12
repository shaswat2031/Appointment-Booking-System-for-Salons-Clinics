const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please select a service']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer information is required']
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee information is required']
  },
  date: {
    type: Date,
    required: [true, 'Please select a date for the appointment']
  },
  startTime: {
    type: String,
    required: [true, 'Please select a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please select an end time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for quick search by date
appointmentSchema.index({ date: 1, employee: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
