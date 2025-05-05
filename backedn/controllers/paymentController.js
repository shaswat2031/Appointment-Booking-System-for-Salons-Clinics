const Payment = require("../models/Payment");
const Vendor = require("../models/Vendor");

// Process a payment for a subscription
const processPayment = async (req, res) => {
  try {
    const { planType, billingCycle, paymentToken } = req.body;

    if (!planType || !billingCycle || !paymentToken) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    // Check if payment token already exists
    const existingPayment = await Payment.findOne({ paymentToken });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment token already used",
      });
    }

    // Calculate amount based on plan and billing cycle
    let amount;
    switch (planType) {
      case "starter":
        amount = billingCycle === "monthly" ? 600 : 6000;
        break;
      case "growth":
        amount = billingCycle === "monthly" ? 2400 : 24000;
        break;
      case "premium":
        amount = billingCycle === "monthly" ? 5000 : 50000;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid plan type",
        });
    }

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(
      expiresAt.getMonth() + (billingCycle === "monthly" ? 1 : 12)
    );

    // Create payment record
    const payment = new Payment({
      amount,
      planType,
      billingCycle,
      paymentToken,
      status: "completed", // For demo purposes, mark as completed immediately
      expiresAt,
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        id: payment._id,
        amount,
        planType,
        billingCycle,
        paymentToken,
        status: payment.status,
        expiresAt: payment.expiresAt,
      },
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

// Verify payment status
const verifyPayment = async (req, res) => {
  try {
    const { paymentToken } = req.query;

    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        message: "Payment token is required",
      });
    }

    const payment = await Payment.findOne({ paymentToken });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      verified: payment.status === "completed",
      payment: {
        id: payment._id,
        amount: payment.amount,
        planType: payment.planType,
        billingCycle: payment.billingCycle,
        status: payment.status,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

module.exports = {
  processPayment,
  verifyPayment,
};
