const placeholderImages = ["KKSgb22422", "KKSgb22423"];

function getRandomPlaceholder() {
  const index = Math.floor(Math.random() * placeholderImages.length);
  return placeholderImages[index];
}

const { events, locations, allowedDates, generateEvents } = require("../models/data");
const { v4: uuidv4 } = require("uuid");
const Mutex = require("../utils/lock");
const bookingLock = new Mutex();

exports.getEvents = async (req, res, next) => {
  try {
    const locationsMap = new Map(locations.map((loc) => [loc.id, loc]));
    const enriched = events.map((e) => {
      // Hvis artworkIds ikke findes eller er tomt, tilføj en placeholder
      if (!e.artworkIds || e.artworkIds.length === 0) {
        e.artworkIds = [getRandomPlaceholder()];
      }
      const location = locationsMap.get(e.locationId);
      return { ...e, location };
    });
    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!event.artworkIds || event.artworkIds.length === 0) {
      event.artworkIds = [getRandomPlaceholder()];
    }
    const location = locations.find((loc) => loc.id === event.locationId);
    res.json({ ...event, location });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, locationId, curator, artworkIds } = req.body;

    if (!allowedDates.includes(date)) {
      return res.status(400).json({
        message: "Invalid date – must be one of: " + allowedDates.join(", "),
      });
    }
    const location = locations.find((l) => l.id === locationId);
    if (!location) return res.status(404).json({ message: "Location not found" });

    const conflict = events.find((e) => e.date === date && e.locationId === locationId);
    if (conflict) return res.status(400).json({ message: "Location already in use on this date" });

    const newEvent = {
      id: uuidv4(),
      title,
      description: description || "",
      date,
      locationId,
      curator,
      totalTickets: location.maxGuests,
      bookedTickets: 0,
      artworkIds: artworkIds || [],
    };
    events.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { title, date, locationId, curator, description, artworkIds } = req.body;

    // Find det event, der skal opdateres.
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found." });
    }

    const currentEvent = events[eventIndex];

    // Kombiner de nye værdier med de eksisterende, så vi altid har en fuldstændig opdateret sammenligningsversion.
    const updatedDate = date !== undefined ? date : currentEvent.date;
    const updatedLocation = locationId !== undefined ? locationId : currentEvent.locationId;

    // Tjek for konflikt: Sørg for, at intet andet event (med forskelligt id) har samme kombination af dato og lokation.
    const conflict = events.find((e) => e.id !== eventId && e.date === updatedDate && e.locationId === updatedLocation);
    if (conflict) {
      return res.status(409).json({
        message: "Conflict: Another event already exists at this date and location.",
      });
    }

    // Hvis der ikke er konflikt, opdateres de leverede felter.
    if (title !== undefined) currentEvent.title = title;
    if (date !== undefined) currentEvent.date = date;
    if (locationId !== undefined) {
      // Sørg for, at den nye lokation findes.
      const location = locations.find((l) => l.id === locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }
      currentEvent.locationId = locationId;
      // Opdater totalTickets baseret på den nye lokations kapacitet.
      currentEvent.totalTickets = location.maxGuests;
    }
    if (curator !== undefined) currentEvent.curator = curator;
    if (description !== undefined) currentEvent.description = description;
    if (artworkIds !== undefined) currentEvent.artworkIds = artworkIds;

    // Gem det opdaterede event.
    events[eventIndex] = currentEvent;
    res.json(currentEvent);
  } catch (error) {
    next(error);
  }
};

exports.bookTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tickets } = req.body;

    // Lås anvendes for at forhindre race conditions
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

exports.deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Fjern eventet fra arrayet
    const deletedEvent = events.splice(eventIndex, 1);
    res.json({
      message: "Event deleted successfully.",
      event: deletedEvent[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.resetEvents = async (req, res, next) => {
  try {
    const unlock = await bookingLock.lock();
    try {
      const newEvents = generateEvents();
      // Ryd den eksisterende events-array og kopier de nye events ind
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
