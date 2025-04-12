const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

// Global middleware for CORS – sættes tidligt i chain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use(express.static("public"));

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importér routes
const datesRoutes = require("./routes/dates");
const locationsRoutes = require("./routes/locations");
const eventsRoutes = require("./routes/events");

// Monter routes
app.use("/dates", datesRoutes);
app.use("/locations", locationsRoutes);
app.use("/events", eventsRoutes);

app.get("/", function (req, res) {
  res.json({
    isMyServerLive: true,
    suggestions: "Try visiting /events or /locations",
  });
});

app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}`);
});
