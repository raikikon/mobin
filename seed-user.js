/**
 * Run using:
 * node seed-user.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

// 🔹 MongoDB connection
const MONGO_URI =process.env.MONGO_URI;
  //"mongodb+srv://raikikon:9smZ4lbN56QWEKYx@cashomobile.6mmsuje.mongodb.net/?appName=CashoMobile";
//mongodb+srv://raikikon:9smZ4lbN56QWEKYx@cashomobile.6mmsuje.mongodb.net/?appName=CashoMobile
//mongodb+srv://mobiledms:vkmobiles@mobiledms.ocoebxi.mongodb.net/?appName=MobileDMS
async function seedUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const username = "moin";      // 👈 change if needed
    const password = "moink@9999";   // 👈 change if needed
    const role = "admin";

    // Check if user exists
    const existing = await User.findOne({ username });
    if (existing) {
      console.log("User already exists:", username);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      username,
      password: hashedPassword,
      role
    });

    console.log("✅ User created successfully");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Role:", role);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedUser();
