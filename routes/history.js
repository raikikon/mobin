const express = require("express");
const router = express.Router();
const History = require("../models/History");

/*
    ➜ Add Event (Purchase / Sale)
*/

/*
    ➜ Get Full History by IMEI
*/
router.get("/history/:imei", async (req, res) => {
  try {
    const history = await History.findOne({ imei: req.params.imei });

    if (!history) {
      return res.status(404).json({ message: "No history found" });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/history", async (req, res) => {
  
  try {
    const devices = await History.find({});

    const formatted = devices.map((device) => {
      const lastEvent =
        device.events && device.events.length > 0
          ? device.events[device.events.length - 1]
          : null;

      return {
        imei: device.imei,
        brand: device.brand,
        make: device.make,
        model: device.model,
        ram: device.ram,
        storage: device.storage,
        color: device.color,
        lastEvent: lastEvent ? lastEvent.eventType : null,
        lastEventDate: lastEvent ? lastEvent.eventDate : null,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;