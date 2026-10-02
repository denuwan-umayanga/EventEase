const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
} = require(
  "../controllers/bookingController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

router.post(
  "/",
  protect,
  createBooking
);

router.get(
  "/my",
  protect,
  getMyBookings
);

router.get(
  "/:id",
  protect,
  getBookingById
);

router.put(
  "/:id",
  protect,
  updateBooking
);

router.put(
  "/:id/cancel",
  protect,
  cancelBooking
);

router.delete(
  "/:id",
  protect,
  deleteBooking
);

module.exports = router;