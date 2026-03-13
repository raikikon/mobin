const mongoose = require("mongoose");

const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  }
});

module.exports = mongoose.model("Model", ModelSchema);