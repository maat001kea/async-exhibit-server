const { v4: uuidv4 } = require("uuid");

function randomTickets(max) {
  return Math.floor(Math.random() * (max + 1));
}

const allowedDates = [
  "2025-05-01",
  "2025-05-02",
  "2025-05-03",
  "2025-05-04",
  "2025-05-05",
  "2025-05-06",
  "2025-05-07",
  "2025-05-08",
  "2025-05-09",
  "2025-05-10",
  "2025-05-11",
  "2025-05-12",
  "2025-05-13",
  "2025-05-14",
  "2025-05-15",
];

const locations = [
  {
    id: "1",
    name: "Kunsthallen A",
    address: "Nyvej 12, 2100 Kbh",
    maxGuests: 50,
    maxArtworks: 10,
  },
  {
    id: "2",
    name: "Galleri B",
    address: "Åboulevarden 21, 8000 Aarhus",
    maxGuests: 30,
    maxArtworks: 6,
  },
  {
    id: "3",
    name: "Warehouse C",
    address: "Vestervej 3, 5000 Odense",
    maxGuests: 100,
    maxArtworks: 15,
  },
  {
    id: "4",
    name: "Kunstforeningen D",
    address: "Strandgade 7, 1401 København K",
    maxGuests: 75,
    maxArtworks: 12,
  },
  {
    id: "5",
    name: "Studio E",
    address: "Havnegade 45, 9000 Aalborg",
    maxGuests: 40,
    maxArtworks: 8,
  },
  {
    id: "6",
    name: "Kunstlab F",
    address: "Nørregade 19, 6700 Esbjerg",
    maxGuests: 60,
    maxArtworks: 9,
  },
  {
    id: "7",
    name: "Kulturhuset G",
    address: "Kirkevej 23, 4600 Køge",
    maxGuests: 120,
    maxArtworks: 20,
  },
  {
    id: "8",
    name: "Galleriet H",
    address: "Søndergade 5, 8600 Silkeborg",
    maxGuests: 45,
    maxArtworks: 7,
  },
  {
    id: "9",
    name: "Kunstrum I",
    address: "Skovvej 88, 2800 Lyngby",
    maxGuests: 55,
    maxArtworks: 11,
  },
  {
    id: "10",
    name: "Værkstedet J",
    address: "Østergade 14, 7500 Holstebro",
    maxGuests: 65,
    maxArtworks: 13,
  },
];

function generateEvents() {
  return [
    {
      id: uuidv4(),
      title: "Abstrakt Aften",
      description:
        "En udstilling der udforsker abstrakte kunstformer gennem forskellige medier. Oplev farver og former i samspil uden begrænsninger.",
      date: "2025-05-01",
      locationId: "1",
      curator: "Anna K.",
      totalTickets: 50,
      bookedTickets: randomTickets(50),
      artworkIds: [],
    },
    {
      id: uuidv4(),
      title: "Lys og Mørke",
      description:
        "En kontrastfyldt udstilling der undersøger samspillet mellem lys og mørke i kunsten. Værker der udforsker skygger, kontraster og stemninger.",
      date: "2025-05-02",
      locationId: "2",
      curator: "Jonas B.",
      totalTickets: 30,
      bookedTickets: randomTickets(30),
      artworkIds: [],
    },
  ];
}

let events = generateEvents();

// Migration: Sikrer at alle eksisterende events har artworkIds
function migrateEvents() {
  events.forEach((e) => {
    if (typeof e.description === "undefined") {
      e.description = "";
    }
    if (!e.artworkIds) {
      e.artworkIds = [];
    }
  });
}
migrateEvents();

// Dynamisk opdatering af billetantal hvert 90. sekund
setInterval(() => {
  events.forEach((e) => {
    e.bookedTickets = randomTickets(e.totalTickets);
  });
  console.log("[INFO] Events opdateret med nye tilfældige billetantal.");
}, 600000);

module.exports = {
  allowedDates,
  locations,
  events,
  generateEvents,
};
