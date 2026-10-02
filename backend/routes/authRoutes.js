const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Register normal user
router.post(
  "/register",
  register
);

// Login user or admin
router.post(
  "/login",
  login
);

// Get currently logged-in user
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;