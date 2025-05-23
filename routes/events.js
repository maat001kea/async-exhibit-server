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
