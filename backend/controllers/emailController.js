const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { generateOtp } = require("../email/generateOtp");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendOtp = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("=== OTP DEBUG ===");
    console.log("Sending to:", email);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
    console.log("PASSWORD length:", process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

    await transporter.sendMail({
      from: '"Grocery App OTP" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: "Your OTP Code",
      html: "<h2>Your OTP is: " + otp + "</h2><p>Valid for 5 minutes</p>"
    });

    console.log("OTP email sent successfully to:", email);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      name
    });

  } catch (error) {
    console.error("=== OTP SEND FAILED ===");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Response:", error.response);
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "user not found" });
    }

    if (!user.otp || user.otp != otp) {
      return res.status(400).json({ msg: "otp invalid" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid OTP Expired" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, token });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};