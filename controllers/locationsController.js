const { locations } = require("../models/data");

exports.getLocations = async (req, res, next) => {
  try {
    res.json(locations);
  } catch (error) {
    next(error);
  }
};
