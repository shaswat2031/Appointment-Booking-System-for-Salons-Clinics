require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { checkRequiredEnvVars } = require("./config/env-check");

// Check required environment variables
if (!checkRequiredEnvVars()) {
  process.exit(1);
}

// Connect to MongoDB
connectDB();

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
