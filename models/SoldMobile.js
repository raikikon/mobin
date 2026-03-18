const mongoose = require("mongoose");

module.exports = mongoose.model(
  "SoldMobile",
  new mongoose.Schema({
    mobileRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mobile"
    },

    make: String,
    model: String,

    storage: String,
    ram: String,
    color: String,

    imei1: String,
    imei2: String,
    serialNumber: String,
images: [
  {
    type: String
  }
],
    seller: {
      name: String,
      address: String,
      mobile: String,
      govtId: String
    },

    buyer: {
      name: String,
      contact: String,
      govtId: String
    },

    soldAt: {
      type: Date,
      default: Date.now,   // ⭐ GUARANTEE
      index: true
    }
  })
);
