const { events, locations, allowedDates, generateEvents } = require("../models/data");
const { v4: uuidv4 } = require("uuid");
const Mutex = require("../utils/lock");
const bookingLock = new Mutex();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SUPABASE_PUBLIC_URL = "https://laqizwqplonobdzjohhg.supabase.co/storage/v1/object/public/artworks";
const dummyImageURL = `${SUPABASE_PUBLIC_URL}/dummy.png`;

// Finder billede-URL uanset filtype
async function findImageUrl(eventId) {
  const { data, error } = await supabase.storage.from("artworks").list("", {
    limit: 1000,
  });

  if (error) {
    console.error("Supabase error:", error.message);
    return dummyImageURL;
  }

  const file = data.find((f) => f.name.startsWith(eventId));
  if (file) {
    return `${SUPABASE_PUBLIC_URL}/${file.name}`;
  }

  return dummyImageURL;
}

exports.getEvents = async (req, res, next) => {
  try {
    const locationsMap = new Map(locations.map((loc) => [loc.id, loc]));

    const enriched = await Promise.all(
      events.map(async (e) => {
        const imageUrl = await findImageUrl(e.id);
        const location = locationsMap.get(e.locationId);

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.date,
          locationId: e.locationId,
          curator: e.curator,
          totalTickets: e.totalTickets,
          bookedTickets: e.bookedTickets,
          artworkIds: e.artworkIds,
          location,
          imageUrl,
        };
      })
    );

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

    const imageUrl = await findImageUrl(event.id);
    const location = locations.find((loc) => loc.id === event.locationId);

    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      locationId: event.locationId,
      curator: event.curator,
      totalTickets: event.totalTickets,
      bookedTickets: event.bookedTickets,
      artworkIds: event.artworkIds,
      location,
      imageUrl,
    });
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
      artworkIds: artworkIds || [],
    };

    events.push(newEvent);

    const imageUrl = await findImageUrl(id);

    res.status(201).json({
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      locationId: newEvent.locationId,
      curator: newEvent.curator,
      totalTickets: newEvent.totalTickets,
      bookedTickets: newEvent.bookedTickets,
      artworkIds: newEvent.artworkIds,
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

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
    if (artworkIds !== undefined) currentEvent.artworkIds = artworkIds;

    events[eventIndex] = currentEvent;

    const imageUrl = await findImageUrl(eventId);

    res.json({
      id: currentEvent.id,
      title: currentEvent.title,
      description: currentEvent.description,
      date: currentEvent.date,
      locationId: currentEvent.locationId,
      curator: currentEvent.curator,
      totalTickets: currentEvent.totalTickets,
      bookedTickets: currentEvent.bookedTickets,
      artworkIds: currentEvent.artworkIds,
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.bookTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tickets } = req.body;

    const unlock = await bookingLock.lock();
    try {
      const event = events.find((e) => e.id === id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

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
//ffg
