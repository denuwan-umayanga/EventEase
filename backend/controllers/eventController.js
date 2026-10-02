const Event = require("../models/Event");

// Create event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      eventDate,
      capacity,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !eventDate ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, location, event date and capacity are required",
      });
    }

    const capacityNumber = Number(capacity);

    if (
      Number.isNaN(capacityNumber) ||
      capacityNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1",
      });
    }

    const parsedDate = new Date(eventDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date",
      });
    }

    if (parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      eventDate: parsedDate,
      capacity: capacityNumber,
      availableSeats: capacityNumber,
      image: imagePath,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

// Get one event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(
      req.params.id
    ).populate(
      "createdBy",
      "name email"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid event ID",
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(
      req.params.id
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.createdBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this event",
      });
    }

    const {
      title,
      description,
      location,
      eventDate,
      capacity,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Event title cannot be empty",
        });
      }

      event.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Event description cannot be empty",
        });
      }

      event.description =
        description.trim();
    }

    if (location !== undefined) {
      if (!location.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Event location cannot be empty",
        });
      }

      event.location = location.trim();
    }

    if (eventDate !== undefined) {
      const parsedDate = new Date(eventDate);

      if (
        Number.isNaN(parsedDate.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date",
        });
      }

      if (parsedDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message:
            "Event date must be in the future",
        });
      }

      event.eventDate = parsedDate;
    }

    if (capacity !== undefined) {
      const newCapacity = Number(capacity);

      if (
        Number.isNaN(newCapacity) ||
        newCapacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity must be at least 1",
        });
      }

      const bookedSeats =
        event.capacity -
        event.availableSeats;

      if (newCapacity < bookedSeats) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity cannot be lower than already booked seats",
        });
      }

      event.capacity = newCapacity;

      event.availableSeats =
        newCapacity - bookedSeats;
    }

    if (req.file) {
      event.image =
        `/uploads/${req.file.filename}`;
    }

    const updatedEvent =
      await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
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

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(
      req.params.id
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.createdBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this event",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
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