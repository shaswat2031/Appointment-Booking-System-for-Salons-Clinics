const express = require("express");
const router = express.Router();
const {
  processPayment,
  verifyPayment,
} = require("../controllers/paymentController");

// Process payment
router.post("/process", processPayment);

// Verify payment
router.get("/verify", verifyPayment);

module.exports = router;
