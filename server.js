const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const productRoutes = require(path.join(__dirname, "routes", "productRoutes"));
const adminRoutes = require(path.join(__dirname, "routes", "adminRoutes"));
const emailRoutes=require(path.join(__dirname,"routes","emailRoutes"));

const app = express();
const port = 8000;

dotenv.config();

// middleware
app.use(express.json());
// extended: true allows for parsing nested objects
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
app.use("/admin",adminRoutes);
app.use("/email",emailRoutes);


app.get("/", (req, res) => {
  res.send("Grocery App Backend is running 🚀");
});


app.use("/uploads",express.static(path.join(__dirname,"uploads")))
// server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
