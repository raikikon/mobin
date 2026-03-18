require("./config/db");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Middleware

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/brand"));
app.use("/api", require("./routes/model"));
app.use("/api", require("./routes/mobile"));
app.use("/api/", require("./routes/history"));
app.use("/api", require("./routes/activity"));
app.use('/api/barcode', require('./routes/barcode'));


// 👉 Serve React build
const clientPath = path.join(__dirname, "client");
app.use(express.static(clientPath));

// 👉 React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/cert.pem"))
};


// https.createServer(sslOptions, app).listen(5000, () => {
//   console.log("🚀 HTTPS server running on https://localhost:5000");
// });


app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000"));
