const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MSID; // Messaging Service SID

const client = twilio(accountSid, authToken);

const sendBookingSMS = async ({ to, vendorName, time, token, date, serviceName }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const message = `✅ Appointment Confirmed! Your booking at ${vendorName} for ${serviceName} is scheduled for ${formattedDate} at ${time}. Your token number is #${token}. Show this token at reception. To check status, visit our website or reply with STATUS.`;

  try {
    await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid,
      to: to
    });

    console.log('📲 Booking confirmation SMS sent to', to);
  } catch (error) {
    console.error('❌ SMS send failed:', error.message);
  }
};

const sendCancellationSMS = async ({ to, vendorName, time, token, date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const message = `❌ Appointment Cancelled: Your booking at ${vendorName} for ${formattedDate} at ${time} (Token #${token}) has been cancelled. If this was a mistake, please contact us or book again. Thank you.`;

  try {
    await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid,
      to: to
    });

    console.log('📲 Cancellation SMS sent to', to);
  } catch (error) {
    console.error('❌ Cancellation SMS failed:', error.message);
  }
};

// Send status update SMS with queue position
const sendStatusUpdateSMS = async ({ to, vendorName, position, waitTime, token, message }) => {
  // Use custom message if provided, otherwise use the default
  const smsText = message || 
    `📱 Queue Update: You are #${position} in line at ${vendorName}. Estimated waiting time: ${waitTime} minutes. Your token is #${token}.`;

  try {
    await client.messages.create({
      body: smsText,
      messagingServiceSid: messagingServiceSid,
      to: to
    });

    console.log('📲 Status update SMS sent to', to);
  } catch (error) {
    console.error('❌ Status update SMS failed:', error.message);
  }
};

const sendReminderSMS = async ({ to, vendorName, time, token, date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const message = `🔔 Reminder: Your appointment at ${vendorName} is tomorrow, ${formattedDate} at ${time}. Your token is #${token}. Reply CONFIRM to confirm or CANCEL to cancel.`;

  try {
    await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid,
      to: to
    });

    console.log('📲 Reminder SMS sent to', to);
  } catch (error) {
    console.error('❌ Reminder SMS failed:', error.message);
  }
};

module.exports = {
  sendBookingSMS,
  sendCancellationSMS,
  sendStatusUpdateSMS,
  sendReminderSMS
};
