const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Activity",
  new mongoose.Schema({
    action: {
      type: String,
      enum: [
        "MOBILE_ADDED",
        "MOBILE_EDITED",
        "MOBILE_DELETED",
        "MOBILE_SENT_TO_REPAIR",
        "MOBILE_BACK_TO_SHELF",
        "MOBILE_SOLD"
      ],
      required: true
    },

    mobileRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mobile"
    },

    soldMobileRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SoldMobile"
    },

    /* 📱 SNAPSHOT */
    make: String,
    model: String,
    storage: String,
    ram: String,
    color: String,
    imei1: String,

    /* 👤 USER */
    user: {
      id: mongoose.Schema.Types.ObjectId,
      role: String
    },

    /* 🕒 TIME */
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    /* 📅 DATE ONLY (YYYY-MM-DD) */
    activityDate: {
      type: String,
      index: true
    }
  })
);
