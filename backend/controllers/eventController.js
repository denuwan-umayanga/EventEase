const mongoose = require("mongoose");

const Event = require("../models/Event");
const Booking = require("../models/Booking");

const ALLOWED_CATEGORIES = [
  "Music",
  "Tech",
  "Business",
  "Sports",
  "Social",
  "Workshop",
];

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      eventDate,
      capacity,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !location ||
      !eventDate ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required event details",
      });
    }

    if (
      !ALLOWED_CATEGORIES.includes(
        category
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event category",
      });
    }

    const capacityNumber =
      Number(capacity);

    if (
      Number.isNaN(
        capacityNumber
      ) ||
      !Number.isInteger(
        capacityNumber
      ) ||
      capacityNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Capacity must be a whole number greater than zero",
      });
    }

    const parsedDate =
      new Date(eventDate);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event date",
      });
    }

    if (
      parsedDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event date must be in the future",
      });
    }

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    const event =
      await Event.create({
        title:
          title.trim(),

        description:
          description.trim(),

        category,

        location:
          location.trim(),

        eventDate:
          parsedDate,

        capacity:
          capacityNumber,

        availableSeats:
          capacityNumber,

        image,

        createdBy:
          req.user._id,
      });

    const populatedEvent =
      await Event.findById(
        event._id
      ).populate(
        "createdBy",
        "name email"
      );

    return res.status(201).json({
      success: true,
      message:
        "Event created successfully",
      event:
        populatedEvent,
    });
  } catch (error) {
    console.error(
      "Create event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating event",
    });
  }
};

// GET ALL EVENTS
const getEvents = async (
  req,
  res
) => {
  try {
    const events =
      await Event.find()
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          eventDate: 1,
        });

    return res.status(200).json({
      success: true,
      count:
        events.length,
      events,
    });
  } catch (error) {
    console.error(
      "Get events error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching events",
    });
  }
};

// GET ONE EVENT
const getEventById = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event ID",
      });
    }

    const event =
      await Event.findById(
        req.params.id
      ).populate(
        "createdBy",
        "name email"
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(
      "Get event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching event",
    });
  }
};

// UPDATE EVENT
const updateEvent = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event ID",
      });
    }

    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found",
      });
    }

    const {
      title,
      description,
      category,
      location,
      eventDate,
      capacity,
    } = req.body;

    if (
      category !== undefined
    ) {
      if (
        !ALLOWED_CATEGORIES.includes(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid event category",
        });
      }

      event.category =
        category;
    }

    if (
      capacity !== undefined &&
      capacity !== ""
    ) {
      const newCapacity =
        Number(capacity);

      if (
        Number.isNaN(
          newCapacity
        ) ||
        !Number.isInteger(
          newCapacity
        ) ||
        newCapacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity must be a whole number greater than zero",
        });
      }

      const bookedSeats =
        event.capacity -
        event.availableSeats;

      if (
        newCapacity <
        bookedSeats
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Capacity cannot be lower than the ${bookedSeats} already booked seat(s)`,
        });
      }

      event.capacity =
        newCapacity;

      event.availableSeats =
        newCapacity -
        bookedSeats;
    }

    if (
      eventDate !== undefined &&
      eventDate !== ""
    ) {
      const parsedDate =
        new Date(eventDate);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid event date",
        });
      }

      if (
        parsedDate <=
        new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Event date must be in the future",
        });
      }

      event.eventDate =
        parsedDate;
    }

    if (
      title !== undefined
    ) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Event title cannot be empty",
        });
      }

      event.title =
        title.trim();
    }

    if (
      description !==
      undefined
    ) {
      if (
        !description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Event description cannot be empty",
        });
      }

      event.description =
        description.trim();
    }

    if (
      location !== undefined
    ) {
      if (
        !location.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Event location cannot be empty",
        });
      }

      event.location =
        location.trim();
    }

    if (req.file) {
      event.image =
        `/uploads/${req.file.filename}`;
    }

    await event.save();

    const updatedEvent =
      await Event.findById(
        event._id
      ).populate(
        "createdBy",
        "name email"
      );

    return res.status(200).json({
      success: true,
      message:
        "Event updated successfully",
      event:
        updatedEvent,
    });
  } catch (error) {
    console.error(
      "Update event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating event",
    });
  }
};

// DELETE EVENT
const deleteEvent = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event ID",
      });
    }

    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found",
      });
    }

    /*
      Do not delete an event while users
      still have confirmed reservations.
    */
    const activeBooking =
      await Booking.findOne({
        eventId:
          event._id,

        status:
          "Confirmed",
      });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This event cannot be deleted because it has confirmed bookings",
      });
    }

    /*
      At this point there are no active
      bookings.

      Remove old cancelled booking records
      so they do not reference an event
      that is about to be deleted.
    */
    await Booking.deleteMany({
      eventId:
        event._id,

      status:
        "Cancelled",
    });

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Event deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting event",
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};