const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Event = require("../models/Event");

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const { eventId, numberOfSeats } = req.body;

    if (!eventId || !numberOfSeats) {
      return res.status(400).json({
        success: false,
        message:
          "Event and number of seats are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const seats = Number(numberOfSeats);

    if (
      Number.isNaN(seats) ||
      !Number.isInteger(seats) ||
      seats < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of seats must be a whole number greater than zero",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (new Date(event.eventDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Bookings are not allowed for past events",
      });
    }

    if (event.availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seats are available`,
      });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
      status: "Confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active booking for this event",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      numberOfSeats: seats,
      status: "Confirmed",
    });

    event.availableSeats -= seats;

    await event.save();

    const populatedBooking =
      await Booking.findById(booking._id)
        .populate(
          "eventId",
          "title description location eventDate capacity availableSeats image"
        )
        .populate("userId", "name email");

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating booking",
    });
  }
};

// GET CURRENT USER BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    })
      .populate(
        "eventId",
        "title description location eventDate capacity availableSeats image"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching bookings",
    });
  }
};

// GET ONE BOOKING
const getBookingById = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    )
      .populate(
        "eventId",
        "title description location eventDate capacity availableSeats image"
      )
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching booking",
    });
  }
};

// UPDATE NUMBER OF SEATS
const updateBooking = async (req, res) => {
  try {
    const { numberOfSeats } = req.body;

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this booking",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled bookings cannot be updated",
      });
    }

    const newSeats = Number(numberOfSeats);

    if (
      Number.isNaN(newSeats) ||
      !Number.isInteger(newSeats) ||
      newSeats < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of seats must be a whole number greater than zero",
      });
    }

    const event = await Event.findById(
      booking.eventId
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }

    const difference =
      newSeats - booking.numberOfSeats;

    if (
      difference > 0 &&
      event.availableSeats < difference
    ) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} additional seats are available`,
      });
    }

    event.availableSeats -= difference;

    booking.numberOfSeats = newSeats;

    await event.save();
    await booking.save();

    const updatedBooking =
      await Booking.findById(booking._id)
        .populate(
          "eventId",
          "title description location eventDate capacity availableSeats image"
        );

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating booking",
    });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to cancel this booking",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    const event = await Event.findById(
      booking.eventId
    );

    if (event) {
      event.availableSeats +=
        booking.numberOfSeats;

      if (
        event.availableSeats >
        event.capacity
      ) {
        event.availableSeats =
          event.capacity;
      }

      await event.save();
    }

    booking.status = "Cancelled";

    await booking.save();

    const cancelledBooking =
      await Booking.findById(booking._id)
        .populate(
          "eventId",
          "title location eventDate capacity availableSeats"
        );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while cancelling booking",
    });
  }
};

// DELETE BOOKING
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this booking",
      });
    }

    if (booking.status === "Confirmed") {
      const event = await Event.findById(
        booking.eventId
      );

      if (event) {
        event.availableSeats +=
          booking.numberOfSeats;

        if (
          event.availableSeats >
          event.capacity
        ) {
          event.availableSeats =
            event.capacity;
        }

        await event.save();
      }
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting booking",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
};
