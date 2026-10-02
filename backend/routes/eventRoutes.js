const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require(
  "../controllers/eventController"
);

const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
);

const upload = require(
  "../middleware/uploadMiddleware"
);

const router = express.Router();

// PUBLIC
router.get(
  "/",
  getEvents
);

router.get(
  "/:id",
  getEventById
);

// ADMIN ONLY
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createEvent
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateEvent
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteEvent
);

module.exports = router;