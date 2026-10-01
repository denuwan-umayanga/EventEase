const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;
