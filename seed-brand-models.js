/**
 * Universal phone brand + model seeder
 * Run:
 *   node scripts/seed-from-url.js "<API_URL>"
 *
 * Example:
 *   node scripts/seed-from-url.js https://phone-specs-g57ftrc7l-azharimms-projects.vercel.app/samsung
 */

const mongoose = require("mongoose");
const axios = require("axios");

/* =========================
   MONGODB
========================= */
const MONGO_URI =
  "mongodb+srv://mobiledms:vkmobiles@mobiledms.ocoebxi.mongodb.net/?appName=MobileDMS";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ Mongo error:", err);
    process.exit(1);
  });

/* =========================
   SCHEMAS
========================= */
const BrandSchema = new mongoose.Schema({
  name: { type: String, unique: true }
});

const ModelSchema = new mongoose.Schema({
  name: String,
  brandId: mongoose.Schema.Types.ObjectId
});

const Brand = mongoose.model("Brand", BrandSchema);
const Model = mongoose.model("Model", ModelSchema);

/* =========================
   READ URL FROM CLI
========================= */
const URL = process.argv[2];
if (!URL) {
  console.error("❌ Please provide API URL");
  process.exit(1);
}

/* =========================
   SEED FUNCTION
========================= */
async function seedFromUrl() {
  try {
    console.log(`🌐 Fetching: ${URL}`);
    const res = await axios.get(URL);

    const data = res.data?.data;
    if (!data) throw new Error("Invalid API response");

    const phones = data.phones;
    if (!Array.isArray(phones) || phones.length === 0) {
      throw new Error("No phones array found");
    }

    /* =========================
       DETECT BRAND NAME
    ========================= */
    let brandName =
      phones[0]?.brand?.trim() ||
      data.title?.replace(/phones/i, "").trim();

    if (!brandName) {
      throw new Error("Unable to detect brand name");
    }

    console.log(`📱 Detected Brand: ${brandName}`);

    /* =========================
       INSERT BRAND
    ========================= */
    let brand = await Brand.findOne({ name: brandName });
    if (!brand) {
      brand = await Brand.create({ name: brandName });
      console.log("➕ Brand inserted");
    } else {
      console.log("✔ Brand already exists");
    }

    /* =========================
       INSERT MODELS
    ========================= */
    let inserted = 0;

    for (const phone of phones) {
      const modelName = phone.phone_name?.trim();
      if (!modelName) continue;

      const exists = await Model.findOne({
        name: modelName,
        brandId: brand._id
      });

      if (!exists) {
        await Model.create({
          name: modelName,
          brandId: brand._id
        });
        inserted++;
      }
    }

    console.log(`📦 Models inserted: ${inserted}`);
    console.log("🎉 SEEDING COMPLETED");
    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR:", err.message);
    process.exit(1);
  }
}

seedFromUrl();
