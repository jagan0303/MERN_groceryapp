const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const productRoutes = require(path.join(__dirname, "routes", "productRoutes"));
const adminRoutes = require(path.join(__dirname, "routes", "adminRoutes"));
const emailRoutes = require(path.join(__dirname, "routes", "emailRoutes"));
const cartRoutes = require(path.join(__dirname, "routes", "cartRoutes"));
const orderRoutes = require(path.join(__dirname, "routes", "orderRoutes"));
const addressRoutes = require(path.join(__dirname, "routes", "addressRoutes"));
const wishlistRoutes = require(path.join(__dirname, "routes", "wishlistRoutes"));
const supportRoutes = require(path.join(__dirname, "routes", "supportRoutes"));
const paymentRoutes = require(path.join(__dirname, "routes", "paymentRoutes"));

const app = express();
const port = 8000;

dotenv.config();

// cors
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-groceryapp-1.onrender.com'],
  credentials: true,
}));
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});