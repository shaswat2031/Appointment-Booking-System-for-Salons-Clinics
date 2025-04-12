// server/utils/generateToken.js

const generateNextToken = async (vendorId, date, BookingModel) => {
    const bookings = await BookingModel.find({ vendor: vendorId, date });
    return bookings.length + 1;
  };
  
  module.exports = { generateNextToken };
  