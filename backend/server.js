const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventEase API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `EventEase server running on port ${PORT}`
  );
});
