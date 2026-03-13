const router = require("express").Router();
const Mobile = require("../models/Mobile");
const SoldMobile = require("../models/SoldMobile");
const auth = require("../middleware/auth");
const History = require("../models/History");
const logActivity = require("../utils/logActivity");
/* =======================
   BUY MOBILE
======================= */
router.post("/mobile/buy", auth, async (req, res) => {
  const mobile = await Mobile.create({
    make: req.body.make,
    model: req.body.model,
    imei1: req.body.imei1,
    imei2: req.body.imei2,
    serialNumber: req.body.serialNumber,
    storage: req.body.storage,
    ram: req.body.ram,
    color: req.body.color,
    accessories: req.body.accessories,
    seller: {
      ...req.body.seller,
      purchaseDate: req.body.seller?.purchaseDate || new Date()
    },
    status: "ON_SHELF",
    history: [{ action: "BOUGHT", details: req.body }]
  });

  await logActivity({
    action: "MOBILE_ADDED",
    mobile,
    user: req.user
  });

/* 
=======================================================
HISTORY
=======================================================
*/
  await History.updateOne(
  { imei: mobile.imei1 }, // assuming imei1 is your main IMEI
  {
    $setOnInsert: {
      imei: mobile.imei1,
      brand: mobile.make || "",
      make: mobile.make || "",
      model: mobile.model || "",
      ram: mobile.ram || "",
      storage: mobile.storage || "",
      color: mobile.color || "",
    },
    $push: {
      events: {
        eventType: "PURCHASED",
        purchasedFrom: req.body.seller.name || "Unknown",
        purchaserPhone: req.body.seller.mobile || "",
        
      },
    },
  },
  { upsert: true }
);
/* 
=======================================================
*/

  res.json(mobile);
});


/* =======================
   SHELF LIST
======================= */
router.get("/mobile/shelf", auth, async (_, res) => {
  res.json(await Mobile.find({ status: "ON_SHELF" }));
});

router.get("/mobile/repair", auth, async (_, res) => {
  res.json(await Mobile.find({ status: "REPAIR" }));
});
//=========
router.get("/mobile/:id", auth, async (req, res) => {
  res.json(await Mobile.findById(req.params.id));
});

/* =======================
   EDIT MOBILE
======================= */
router.post("/mobile/:id/edit", auth, async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile)
    return res.status(404).json({ error: "Mobile not found" });

  const before = mobile.toObject();

  // Editable fields
  mobile.make = req.body.make;
  mobile.model = req.body.model;
  mobile.imei2 = req.body.imei2;
  mobile.serialNumber = req.body.serialNumber;
  mobile.seller = req.body.seller;
  mobile.accessories = req.body.accessories;
  mobile.color = req.body.color;
  mobile.ram=req.body.ram;
  mobile.storage=req.body.storage;



  mobile.history.push({
    action: "EDITED",
    details: {
      before,
      after: req.body
    }
  });

  await logActivity({
    action: "MOBILE_EDITED",
    mobile,
    user: req.user
  });

  await mobile.save();
  res.json(mobile);
});

/* SOLD BY DATE (YYYY-MM-DD) */
router.get("/mobile/sold/:date", auth, async (req, res) => {
  try {
    const { date } = req.params;

    // Expecting format: YYYY-MM-DD
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const sold = await SoldMobile.find({
      soldAt: { $gte: start, $lte: end }
    }).sort({ soldAt: -1 });

    res.json(sold);
  } catch (err) {
    console.error("Sold by date error:", err);
    res.status(400).json({ error: "Invalid date format" });
  }
});
//////////////////
/* =======================
   PURCHASE BY DATE (YYYY-MM-DD)
======================= */
router.get("/mobile/purchase/:date", auth, async (req, res) => {
  try {
    const { date } = req.params;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const purchased = await Mobile.find({
      status: "ON_SHELF",  // ✅ Only shelf mobiles
      "seller.purchaseDate": { $gte: start, $lte: end }
    }).sort({ "seller.purchaseDate": -1 });

    res.json(purchased);
  } catch (err) {
    console.error("Purchase by date error:", err);
    res.status(400).json({ error: "Invalid date format" });
  }
});


/* =======================
   DELETE MOBILE
======================= */
router.post("/mobile/:id/delete", auth, async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile)
    return res.status(404).json({ error: "Mobile not found" });

  await Mobile.findByIdAndDelete(req.params.id);

    await logActivity({
    action: "MOBILE_DELETED",
    mobile,
    user: req.user
  });


  res.json({ message: "Mobile deleted successfully" });
});

/* =======================
   SEND TO REPAIR
======================= */
router.post("/mobile/:id/repair", auth, async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile)
    return res.status(404).json({ error: "Mobile not found" });

  mobile.status = "REPAIR";
  mobile.repairInfo = {
    ...req.body,
    sentAt: new Date()   // ✅ ADD THIS
  };  mobile.history.push({ action: "REPAIR_SENT", details: req.body });

await logActivity({
    action: "MOBILE_SENT_TO_REPAIR",
    mobile,
    user: req.user
  });

  await mobile.save();
  res.json(mobile);
});


/* =======================
   REPAIR → BACK TO SHELF
======================= */
router.post("/mobile/:id/repair/back-to-shelf", auth, async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);

  if (!mobile || mobile.status !== "REPAIR")
    return res.status(400).json({ error: "Not in repair" });

  mobile.status = "ON_SHELF";
  mobile.repairInfo = undefined;
  mobile.history.push({
    action: "REPAIR_COMPLETED",
    details: { remarks: req.body?.remarks }
  });

  await logActivity({
    action: "MOBILE_BACK_TO_SHELF",
    mobile,
    user: req.user
  });

  await mobile.save();
  res.json(mobile);
});

/* =======================
   SELL MOBILE
======================= */
router.post("/mobile/:id/sell", auth, async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile)
    return res.status(404).json({ error: "Mobile not found" });

  await SoldMobile.create({
  mobileRef: mobile._id,
  make: mobile.make,
  model: mobile.model,
  storage: mobile.storage,
  ram: mobile.ram,
  color: mobile.color,
  imei1: mobile.imei1,
  imei2: mobile.imei2,
  serialNumber: mobile.serialNumber,
  seller: mobile.seller,
  buyer: req.body.buyer,
  soldAt: new Date()
});


 await logActivity({
    action: "MOBILE_SOLD",
    mobile,
    SoldMobile,
    user: req.user
  });

  await Mobile.findByIdAndDelete(req.params.id);


  /* 
=======================================================
HISTORY
=======================================================
*/
await History.updateOne(
  { imei: mobile.imei1 },
  {
    $push: {
      events: {
        eventType: "SOLD",
        soldTo: req.body.buyer.name || "",
        buyerPhone: req.body.buyer.contact || "",
        
      },
    },
  }
);
  /* 
=======================================================
END
=======================================================
*/


  res.json({ message: "Mobile sold successfully" });
});

/* =======================
   SOLD LIST
======================= */
router.get("/mobile/sold", auth, async (_, res) => {
  res.json(await SoldMobile.find().sort({ soldAt: -1 }));
});

module.exports = router;
