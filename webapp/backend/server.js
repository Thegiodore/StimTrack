require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// 1. IMPORT SOCKET.IO
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// 2. CREATE HTTP SERVER FOR SOCKET.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend
    credentials: true
  }
});

function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  if (req.user?.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Forbidden (Admin only)" });
  }
  next();
}

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// 3. INCREASE LIMIT FOR BASE64 IMAGES (Crucial for AI Frames)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const users = [
  {
    id: "admin-1",
    username: "Admin",
    email: "admin@stimtrack.local",
    passwordHash: bcrypt.hashSync("Admin123!", 10),
    role: "admin",
    profile: { child: null, caregiverRole: "Parent" },
  },
];

const logsByUserId = {};

function ensureUserLogs(userId) {
  if (!logsByUserId[userId]) {
    logsByUserId[userId] = []; // Start with empty array for real data
  }
  return logsByUserId[userId];
}

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = users.find((u) => u.email === email);
        if (!user) return done(null, false, { message: "User not found" });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return done(null, false, { message: "Incorrect password" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

// ---------------------------------------------------------
// 4. NEW: AI DETECTION ENDPOINT (Python script hits this)
// ---------------------------------------------------------
app.post("/api/ai/detection", (req, res) => {
  const { action, emotion, accuracy, frame, date, time } = req.body;

  // For thesis prototype: We send this to the main Admin user
  // In production, the Mini PC would send a specific 'userId'
  const targetUserId = "admin-1"; 
  const logs = ensureUserLogs(targetUserId);

  const newLog = {
    id: Date.now(),
    time: time,
    date: date,
    type: action,      // Mapping 'action' from Python to 'type' in your JSX
    emotion: emotion,
    accuracy: accuracy,
    image: frame,      // Base64 string
    details: `AI detected ${action} with ${emotion} expression.`
  };

  // Add to start of history
  logs.unshift(newLog);

  // 5. BROADCAST TO FRONTEND VIA SOCKET.IO
  io.emit("NEW_DETECTION", newLog);

  console.log(`[AI Event]: ${action} detected. accuracy: ${accuracy}`);
  res.json({ ok: true, message: "Detection broadcasted" });
});
// ---------------------------------------------------------

app.get("/", (req, res) => res.send("OK - backend is running"));

app.post("/api/Register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ ok: false, message: "Missing fields" });
  if (users.some((u) => u.email === email)) return res.status(409).json({ ok: false, message: "Email already used" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role: "user",
    profile: { child: null, caregiverRole: "Parent" },
  };
  users.push(user);
  ensureUserLogs(user.id);
  res.json({ ok: true, message: "Registered", user: { id: user.id, username, email, role: user.role } });
});

app.post("/api/Login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ ok: false, message: info?.message || "Login failed" });
    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      ensureUserLogs(user.id);
      res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    });
  })(req, res, next);
});

app.post("/api/Logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true, message: "Logged out" });
    });
  });
});

app.get("/api/auth/status", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role } });
});

app.get("/api/Logs", requireAuth, (req, res) => {
  const userId = req.user.id;
  const logs = ensureUserLogs(userId);
  res.json({ ok: true, logs });
});

// Admin and Profile routes remain unchanged...
// [Keeping your Profile/Admin logic here as it was]

// 6. START SERVER USING THE 'server' CONSTANT (Necessary for Socket.io)
const PORT = 5000;
server.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));