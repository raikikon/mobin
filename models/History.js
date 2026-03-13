const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["PURCHASED", "SOLD"],
      required: true,
    },

    purchasedFrom: String,
    soldTo: String,

    purchaserPhone: String,
    buyerPhone: String,

    eventDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    // 🔑 PRIMARY KEY
    imei: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 📱 DEVICE DETAILS (STATIC — should not change)
    brand: {
      type: String,
      required: true,
    },

    make: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    ram: String,
    storage: String,
    color: String,

    // 🔁 EVENT CHAIN
    events: [eventSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);