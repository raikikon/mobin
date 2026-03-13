const mongoose = require("mongoose");

module.exports = mongoose.model("Brand",
  new mongoose.Schema({
    name: { type: String, unique: true }
  })
);
