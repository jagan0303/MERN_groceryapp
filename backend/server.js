console.log("=== SERVER.JS STARTED ===");
console.log("Node version:", process.version);
console.log("PORT env:", process.env.PORT);

const express = require("express");
console.log("express loaded");

const mongoose = require("mongoose");
console.log("mongoose loaded");

const dotenv = require("dotenv");
console.log("dotenv loaded");

const path = require("path");
console.log("path loaded");

dotenv.config();
console.log("dotenv.config() done");
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID);
console.log("CLOUDINARY_CLOUD_NAME exists:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

console.log("loading productRoutes...");
const productRoutes = require(path.join(__dirname, "routes", "productRoutes"));
console.log("productRoutes loaded OK");

console.log("loading adminRoutes...");
const adminRoutes = require(path.join(__dirname, "routes", "adminRoutes"));
console.log("adminRoutes loaded OK");

console.log("loading emailRoutes...");
const emailRoutes = require(path.join(__dirname, "routes", "emailRoutes"));
console.log("emailRoutes loaded OK");

console.log("loading cartRoutes...");
const cartRoutes = require(path.join(__dirname, "routes", "cartRoutes"));
console.log("cartRoutes loaded OK");

console.log("loading orderRoutes...");
const orderRoutes = require(path.join(__dirname, "routes", "orderRoutes"));
console.log("orderRoutes loaded OK");

console.log("loading addressRoutes...");
const addressRoutes = require(path.join(__dirname, "routes", "addressRoutes"));
console.log("addressRoutes loaded OK");

console.log("loading wishlistRoutes...");
const wishlistRoutes = require(path.join(__dirname, "routes", "wishlistRoutes"));
console.log("wishlistRoutes loaded OK");

console.log("loading supportRoutes...");
const supportRoutes = require(path.join(__dirname, "routes", "supportRoutes"));
console.log("supportRoutes loaded OK");

console.log("loading paymentRoutes...");
const paymentRoutes = require(path.join(__dirname, "routes", "paymentRoutes"));
console.log("paymentRoutes loaded OK");

console.log("all routes loaded, creating app...");

const app = express();

// cors
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-groceryapp-1.onrender.com'],
  credentials: true,
}));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("connecting to mongodb...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("DB connection error:", error.message);
  });

// routes
app.use("/api", productRoutes);
app.use("/admin", adminRoutes);
app.use("/email", emailRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/address", addressRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/support", supportRoutes);
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Grocery App Backend is running 🚀");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 7860;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=== Server running at http://0.0.0.0:${PORT} ===`);
});

process.on('uncaughtException', (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on('unhandledRejection', (err) => {
  console.error("UNHANDLED REJECTION:", err);
});