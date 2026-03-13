const router = require("express").Router();
const Model = require("../models/Model");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");

router.post("/model/add", auth, admin, async (req, res) => {
  res.json(await Model.create(req.body));
});

router.get("/model/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ error: "Invalid brandId" });
    }

    const models = await Model.find({
      brandId: new mongoose.Types.ObjectId(brandId)
    }).select("_id name");

    res.json(models);
  } catch (err) {
    console.error("Model fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/model/:id", auth, async (req, res) => {
  const model = await Model.findById(req.params.id);
  if (!model)
    return res.status(404).json({ error: "Model not found" });

  // delete mobiles using this model
  //await Mobile.deleteMany({ model: model.name });

  await Model.findByIdAndDelete(req.params.id);

  res.json({ message: "Model deleted" });
});
module.exports = router;
