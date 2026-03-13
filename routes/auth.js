const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔒 Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username or password missing" });
    }

    // 🔍 Find user
    const user = await User.findOne({ username });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(402).json({ error: "Invalid credentials" });
    }

    // 🎫 Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "SECRET",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
