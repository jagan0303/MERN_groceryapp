const controller = require("../controllers/emailController");
const express = require("express");
const router = express.Router();

// Password auth routes
router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);

// OTP auth routes
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);

module.exports = router;