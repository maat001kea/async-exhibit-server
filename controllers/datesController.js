const { allowedDates } = require("../models/data");

exports.getDates = async (req, res, next) => {
  try {
    res.json(allowedDates);
  } catch (error) {
    next(error);
  }
};
