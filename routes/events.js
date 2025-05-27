// const express = require("express");
// const router = express.Router();
// const eventsController = require("../controllers/eventsController"); // 👈 tilføjet denne linje

// router.get("/", eventsController.getEvents);
// router.post("/", eventsController.createEvent);
// router.get("/:id", eventsController.getEventById);
// router.patch("/:id", eventsController.updateEvent);
// router.delete("/:id", eventsController.deleteEvent);
// router.put("/:id/book", eventsController.bookTickets);
// router.post("/reset", eventsController.resetEvents);

// module.exports = router;

module.exports = router;

router.get("/", eventsController.getEvents);
router.post("/", eventsController.createEvent);
router.get("/:id", eventsController.getEventById);
router.patch("/:id", eventsController.updateEvent);
router.delete("/:id", eventsController.deleteEvent);
router.put("/:id/book", eventsController.bookTickets);
router.post("/reset", eventsController.resetEvents);

// 👇 tilføj denne nye route
router.post("/delete-image", eventsController.deleteImage);

module.exports = router;
