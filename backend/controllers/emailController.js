const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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

// ─── REGISTER WITH PASSWORD ───────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing && existing.password) {
      return res.status(400).json({ msg: "Email already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (existing) {
      existing.name = name;
      existing.password = hashedPassword;
      await existing.save();
      user = existing;
    } else {
      user = await User.create({ name, email, password: hashedPassword });
    }

    return res.status(201).json({
      success: true,
      msg: "Account created successfully"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN WITH PASSWORD ──────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Account not found. Please register first." });
    }

    if (!user.password) {
      return res.status(400).json({ msg: "This account uses OTP login. Please use OTP to sign in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── SEND OTP ─────────────────────────────────────────────
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

    await transporter.sendMail({
      from: '"Grocery App OTP" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: "Your OTP Code",
      html: "<h2>Your OTP is: " + otp + "</h2><p>Valid for 5 minutes</p>"
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      name
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────
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

    return res.json({ success: true, token, name: user.name, email: user.email });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};