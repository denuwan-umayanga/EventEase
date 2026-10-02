require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require(
  "../models/User"
);

const createAdmin = async () => {
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    const email =
      process.env.ADMIN_EMAIL
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email,
      });

    const hashedPassword =
      await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );

    if (existingUser) {
      existingUser.name =
        process.env.ADMIN_NAME ||
        "EventEase Admin";

      existingUser.password =
        hashedPassword;

      existingUser.isAdmin =
        true;

      await existingUser.save();

      console.log(
        "Existing account converted to admin."
      );
    } else {
      await User.create({
        name:
          process.env.ADMIN_NAME ||
          "EventEase Admin",

        email,

        password:
          hashedPassword,

        isAdmin: true,
      });

      console.log(
        "Admin account created successfully."
      );
    }
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error.message
    );
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
