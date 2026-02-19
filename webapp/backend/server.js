require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OK - backend is running");
});

app.post("/api/Login", (req, res) => {
  res.json({ ok: true, message: "login route hit", body: req.body });
});

app.post("/api/Register", (req, res) => {
  res.json({ ok: true, message: "register route hit" });
});

app.post("/api/Logout", (req, res) => {
  res.json({ ok: true, message: "logout route hit" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
