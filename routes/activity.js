const router = require("express").Router();
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");

/* 🔹 GET ALL ACTIVITY */
router.get("/activity", auth, async (req, res) => {
  const logs = await Activity.find()
    .sort({ createdAt: -1 });

  res.json(logs);
});

/* 🔹 GET ACTIVITY BY DATE (YYYY-MM-DD) */
router.get("/activity/:date", auth, async (req, res) => {
  const { date } = req.params;

  // basic validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: "Invalid date format. Use YYYY-MM-DD"
    });
  }

  const logs = await Activity.find({
    activityDate: date
  }).sort({ createdAt: -1 });

  res.json(logs);
});

module.exports = router;
