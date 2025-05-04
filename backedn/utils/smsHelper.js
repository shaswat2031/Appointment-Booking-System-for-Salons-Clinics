/**
 * SMS Helper - Twilio removed
 * This file provides SMS functionality without using Twilio
 */

// No Twilio import needed

/**
 * Send SMS message (mock implementation)
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // Just log the message instead of sending via Twilio
    console.log(
      `[SMS NOTIFICATION MOCK] To: ${phoneNumber}, Message: ${message}`
    );

    // Return success response
    return {
      success: true,
      message: "SMS notification logged (Twilio removed)",
    };
  } catch (error) {
    console.error("Error in SMS service (mock):", error);
    return {
      success: false,
      message: "Error in SMS service",
      error: error.message,
    };
  }
};

module.exports = { sendSMS };
