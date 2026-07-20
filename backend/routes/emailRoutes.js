const controller = require("../controllers/emailController");
const express = require("express");
const router = express.Router();

// Password auth
router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

// OTP auth
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);

module.exports = router;