// server/utils/generateToken.js
const Vendor = require('../models/Vendor');

const generateNextToken = async (vendorId, bookingDate, BookingModel) => {
  // Convert booking date to YYYY-MM-DD format for consistency
  const bookingDateStr = new Date(bookingDate).toISOString().split('T')[0];
  const vendor = await Vendor.findById(vendorId);
  
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  
  // Initialize tokensByDate if it doesn't exist
  if (!vendor.tokensByDate) {
    vendor.tokensByDate = {};
  }
  
  // Get the highest token number for this specific date
  const highestTokenForDate = await BookingModel.find({ 
    vendor: vendorId,
    date: bookingDateStr
  }).sort({ token: -1 }).limit(1);
  
  let nextToken = 1; // Default starting token
  
  if (highestTokenForDate && highestTokenForDate.length > 0) {
    // If there are existing bookings for this date, increment the highest token
    nextToken = highestTokenForDate[0].token + 1;
  } else if (vendor.tokensByDate[bookingDateStr]) {
    // If we have a stored counter for this date but no bookings found
    nextToken = vendor.tokensByDate[bookingDateStr] + 1;
  }
  
  // Update the vendor's token counter for this specific date
  vendor.tokensByDate[bookingDateStr] = nextToken;
  await vendor.save();
  
  return nextToken;
};

module.exports = {
  generateNextToken
};
