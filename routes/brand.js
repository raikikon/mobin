const router = require("express").Router();
const Brand = require("../models/Brand");
const auth = require("../middleware/auth");
const Model = require("../models/Model");
const admin = require("../middleware/admin");

router.post("/brand/add", auth, admin, async (req, res) => {
  res.json(await Brand.create(req.body));
});

router.get("/brand", auth, async (_, res) => {
  res.json(await Brand.find());
});
router.delete("/brand/:id", auth, async (req, res) => {
  const brandId = req.params.id;

  const brand = await Brand.findById(brandId);
  if (!brand)
    return res.status(404).json({ error: "Brand not found" });

  // delete models
  await Model.deleteMany({ brandId });

  // delete mobiles
  await Model.deleteMany({ make: brand.name });

  // delete brand
  await Brand.findByIdAndDelete(brandId);

  res.json({ message: "Brand and related data deleted" });
});
module.exports = router;
