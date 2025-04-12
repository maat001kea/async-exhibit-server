const express = require("express");
const router = express.Router();
const datesController = require("../controllers/datesController");

router.get("/", datesController.getDates);

module.exports = router;
