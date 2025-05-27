const { events, locations, allowedDates, generateEvents } = require("../models/data");
const { v4: uuidv4 } = require("uuid");
const Mutex = require("../utils/lock");
const bookingLock = new Mutex();

const SUPABASE_PUBLIC_URL = "https://laqizwqplonobdzjohhg.supabase.co/storage/v1/object/public/artworks";
const dummyImageURL = `${SUPABASE_PUBLIC_URL}/dummy.png`;

// Returnér URL’en til eventets billede
function getArtworkUrl(eventId) {
  return `${SUPABASE_PUBLIC_URL}/${eventId}.png`;
}

// GET alle events
exports.getEvents = async (req, res, next) => {
  try {
    const locationsMap = new Map(locations.map((loc) => [loc.id, loc]));

    const enriched = events.map((e) => {
      // Hvis artworkIds mangler, tilføj fallback
      if (!e.artworkIds || e.artworkIds.length === 0) {
        e.artworkIds = [getArtworkUrl(e.id)];
      }

      const imageUrl = getArtworkUrl(e.id);
      const location = locationsMap.get(e.locationId);

      return {
        ...e,
        location,
        imageUrl, // 🔥 Tilføj imageUrl felt
      };
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// GET enkelt event
exports.getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!event.artworkIds || event.artworkIds.length === 0) {
      event.artworkIds = [getArtworkUrl(event.id)];
    }

    const imageUrl = getArtworkUrl(event.id);
    const location = locations.find((loc) => loc.id === event.locationId);

    res.json({
      ...event,
      location,
      imageUrl, // 🔥 Tilføj imageUrl felt
    });
  } catch (error) {
    next(error);
  }
};

// POST opret event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, locationId, curator, artworkIds } = req.body;

    if (!allowedDates.includes(date)) {
      return res.status(400).json({
        message: "Invalid date – must be one of: " + allowedDates.join(", "),
      });
    }

    const location = locations.find((l) => l.id === locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const conflict = events.find((e) => e.date === date && e.locationId === locationId);
    if (conflict) {
      return res.status(400).json({ message: "Location already in use on this date" });
    }

    const id = uuidv4();
    const newEvent = {
      id,
      title,
      description: description || "",
      date,
      locationId,
      curator,
      totalTickets: location.maxGuests,
      bookedTickets: 0,
      artworkIds: artworkIds && artworkIds.length > 0 ? artworkIds : [getArtworkUrl(id)],
    };

    events.push(newEvent);

    const imageUrl = getArtworkUrl(id);

    res.status(201).json({
      ...newEvent,
      imageUrl, // 🔥 Tilføj imageUrl felt
    });
  } catch (error) {
    next(error);
  }
};

// PUT opdater event
exports.updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { title, date, locationId, curator, description, artworkIds } = req.body;

    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found." });
    }

    const currentEvent = events[eventIndex];
    const updatedDate = date !== undefined ? date : currentEvent.date;
    const updatedLocation = locationId !== undefined ? locationId : currentEvent.locationId;

    const conflict = events.find((e) => e.id !== eventId && e.date === updatedDate && e.locationId === updatedLocation);
    if (conflict) {
      return res.status(409).json({
        message: "Conflict: Another event already exists at this date and location.",
      });
    }

    if (title !== undefined) currentEvent.title = title;
    if (date !== undefined) currentEvent.date = date;
    if (locationId !== undefined) {
      const location = locations.find((l) => l.id === locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }
      currentEvent.locationId = locationId;
      currentEvent.totalTickets = location.maxGuests;
    }
    if (curator !== undefined) currentEvent.curator = curator;
    if (description !== undefined) currentEvent.description = description;
    if (artworkIds !== undefined && artworkIds.length > 0) {
      currentEvent.artworkIds = artworkIds;
    } else if (!currentEvent.artworkIds || currentEvent.artworkIds.length === 0) {
      currentEvent.artworkIds = [getArtworkUrl(eventId)];
    }

    events[eventIndex] = currentEvent;

    const imageUrl = getArtworkUrl(eventId);

    res.json({
      ...currentEvent,
      imageUrl, // 🔥 Tilføj imageUrl felt
    });
  } catch (error) {
    next(error);
  }
};

// POST book billetter
exports.bookTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tickets } = req.body;

    const unlock = await bookingLock.lock();
    try {
      const event = events.find((e) => e.id === id);
      if (!event) return res.status(404).json({ message: "Event not found" });

      if (event.bookedTickets + tickets > event.totalTickets) {
        return res.status(400).json({ message: "Not enough tickets available" });
      }
      event.bookedTickets += tickets;
      res.json({ message: "Tickets booked", event });
    } finally {
      unlock();
    }
  } catch (error) {
    next(error);
  }
};

// DELETE event
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found." });
    }

    const deletedEvent = events.splice(eventIndex, 1);
    res.json({
      message: "Event deleted successfully.",
      event: deletedEvent[0],
    });
  } catch (error) {
    next(error);
  }
};

// POST reset events
exports.resetEvents = async (req, res, next) => {
  try {
    const unlock = await bookingLock.lock();
    try {
      const newEvents = generateEvents();
      events.length = 0;
      newEvents.forEach((e) => events.push(e));
      res.json({ message: "Events reset" });
    } finally {
      unlock();
    }
  } catch (error) {
    next(error);
  }
};
