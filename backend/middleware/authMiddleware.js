const jwt = require("jsonwebtoken");

const User = require("../models/User");

// CHECK JWT
const protect = async (
  req,
  res,
  next
) => {
  try {
    let token;

    const authorization =
      req.headers.authorization;

    if (
      authorization &&
      authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(
        decoded.userId
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

// ADMIN AUTHORIZATION
const adminOnly = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    req.user.isAdmin !== true
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Admin access required",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};