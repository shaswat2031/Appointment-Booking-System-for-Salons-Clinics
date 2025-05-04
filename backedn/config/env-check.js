/**
 * Environment variable checker
 * This file ensures all required environment variables are present
 */

const checkRequiredEnvVars = () => {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    // Add other required variables like Twilio credentials if needed
    // 'TWILIO_ACCOUNT_SID',
    // 'TWILIO_AUTH_TOKEN',
  ];

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", ")
    );
    console.error("Please check your .env file or environment configuration");
    return false;
  }

  console.log("✅ All required environment variables are present");
  return true;
};

module.exports = { checkRequiredEnvVars };
