// Load environment variables first, before other imports
require("dotenv").config();

const app = require("./app");
const ConnectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

ConnectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
