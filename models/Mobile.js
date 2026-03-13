const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Mobile",
  new mongoose.Schema({
    make: String,
    model: String,

    imei1: { type: String, required: true, unique: true },
    imei2: String,
    serialNumber: String,

    /* 🔹 NEW DEVICE SPECS */
    storage: String,   // e.g. "128 GB"
    ram: String,       // e.g. "8 GB"
    color: String,

       /* 🔹 ACCESSORIES (✅ FIX) */
    accessories: {
      charger: { type: Boolean, default: false },
      box: { type: Boolean, default: false }
    },

    /* 🔹 SELLER DETAILS */
    seller: {
      name: String,
      address: String,
      mobile: String,
      purchaseDate: { type: Date, default: Date.now },  // ✅ ADDED
      govtId: String   // ✅ FIXED
    },

    status: {
      type: String,
      enum: ["ON_SHELF", "REPAIR"],
      default: "ON_SHELF"
    },

    repairInfo: {
  name: String,
  address: String,
  mobile: String,
  description:String,
  sentAt: Date      // ✅ ADD THIS
},
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now },
        details: Object
      }
    ]
  })
);
