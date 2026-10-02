const Booking = require("../models/Booking");
const Event = require("../models/Event");

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    // Admin accounts are for event management only
    if (req.user.isAdmin === true) {
      return res.status(403).json({
        success: false,
        message:
          "Administrators cannot create event bookings",
      });
    }

    const {
      eventId,
      numberOfSeats,
    } = req.body;

    if (
      !eventId ||
      !numberOfSeats
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event and number of seats are required",
      });
    }

    const seats =
      Number(numberOfSeats);

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

    const event =
      await Event.findById(
        eventId
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found",
      });
    }

    if (
      new Date(
        event.eventDate
      ) <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This event has already started or ended",
      });
    }

    if (
      event.availableSeats <
      seats
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Only ${event.availableSeats} seat(s) are available`,
      });
    }

    const existingBooking =
      await Booking.findOne({
        userId:
          req.user._id,

        eventId:
          event._id,

        status:
          "Confirmed",
      });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active booking for this event",
      });
    }

    const booking =
      await Booking.create({
        userId:
          req.user._id,

        eventId:
          event._id,

        numberOfSeats:
          seats,

        status:
          "Confirmed",
      });

    event.availableSeats -=
      seats;

    await event.save();

    const populatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "eventId"
        )
        .populate(
          "userId",
          "name email"
        );

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking:
        populatedBooking,
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

// GET MY BOOKINGS
const getMyBookings = async (
  req,
  res
) => {
  try {
    if (
      req.user.isAdmin ===
      true
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Booking history is available to normal users only",
      });
    }

    const bookings =
      await Booking.find({
        userId:
          req.user._id,
      })
        .populate(
          "eventId"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        bookings.length,
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
const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      ).populate(
        "eventId"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    if (
      booking.userId.toString() !==
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
const updateBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
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

    if (
      booking.status !==
      "Confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only confirmed bookings can be updated",
      });
    }

    const {
      numberOfSeats,
    } = req.body;

    const newSeats =
      Number(numberOfSeats);

    if (
      Number.isNaN(
        newSeats
      ) ||
      !Number.isInteger(
        newSeats
      ) ||
      newSeats < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of seats must be a whole number greater than zero",
      });
    }

    const event =
      await Event.findById(
        booking.eventId
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Associated event not found",
      });
    }

    const seatDifference =
      newSeats -
      booking.numberOfSeats;

    if (
      seatDifference > 0 &&
      event.availableSeats <
        seatDifference
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Only ${event.availableSeats} additional seat(s) are available`,
      });
    }

    event.availableSeats -=
      seatDifference;

    booking.numberOfSeats =
      newSeats;

    await event.save();
    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      ).populate(
        "eventId"
      );

    return res.status(200).json({
      success: true,
      message:
        "Booking updated successfully",
      booking:
        updatedBooking,
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
const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
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

    if (
      booking.status ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This booking is already cancelled",
      });
    }

    const event =
      await Event.findById(
        booking.eventId
      );

    if (event) {
      event.availableSeats +=
        booking.numberOfSeats;

      await event.save();
    }

    booking.status =
      "Cancelled";

    await booking.save();

    const cancelledBooking =
      await Booking.findById(
        booking._id
      ).populate(
        "eventId"
      );

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking:
        cancelledBooking,
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
const deleteBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
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

    // If a confirmed booking is deleted,
    // release its seats first.
    if (
      booking.status ===
      "Confirmed"
    ) {
      const event =
        await Event.findById(
          booking.eventId
        );

      if (event) {
        event.availableSeats +=
          booking.numberOfSeats;

        await event.save();
      }
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Booking deleted successfully",
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