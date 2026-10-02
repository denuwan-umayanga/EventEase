const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createBooking);

router.get("/my", getMyBookings);

router.get("/:id", getBookingById);

router.put("/:id", updateBooking);

router.put("/:id/cancel", cancelBooking);

router.delete("/:id", deleteBooking);

module.exports = router;
