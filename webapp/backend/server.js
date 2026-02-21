require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// HASHING
const bcrypt = require("bcrypt");
// UNIQUE ID
const crypto = require("crypto");

const app = express();

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
app.use(express.json());

// Session middleware (required)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

// Passport middleware (required)
app.use(passport.initialize());
app.use(passport.session());

// ADMIN
const users = [
  {
    id: "admin-1",
    username: "Admin",
    email: "admin@stimtrack.local",
    passwordHash: bcrypt.hashSync("Admin123!", 10), // hashed
    role: "admin",
    profile: { child: null, caregiverRole: "Parent" },
  },
];

// ✅ Per-user logs store (in-memory)
const logsByUserId = {};

// ✅ Mock AI logs template (keep this for now)
function makeMockLogs() {
  return [
    {
      id: 1,
      time: "14:08",
      date: "Feb 3, 2026",
      type: "Hand Flapping",
      emotion: "Happy",
      confidence: 0.94,
      image: "https://images.unsplash.com/photo-1620121692029-d088224efc74?q=80&w=400",
      details: "Repetitive hand movement detected for 15 seconds.",
    },
    {
      id: 2,
      time: "09:16",
      date: "Feb 3, 2026",
      type: "Rocking",
      emotion: "Anxious",
      confidence: 0.88,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400",
      details: "Rhythmic swaying detected while sitting near the window.",
    },
    {
      id: 3,
      time: "08:45",
      date: "Feb 3, 2026",
      type: "Pacing",
      emotion: "Neutral",
      confidence: 0.92,
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=400",
      details: "Continuous walking back and forth in the living room.",
    },
  ];
}

function ensureUserLogs(userId) {
  if (!logsByUserId[userId]) {
    logsByUserId[userId] = makeMockLogs();
  }
  return logsByUserId[userId];
}

// Local strategy (email + password)
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

// Routes
app.get("/", (req, res) => res.send("OK - backend is running"));

// Register (capital route kept)
app.post("/api/Register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ ok: false, message: "Missing fields" });

  if (users.some((u) => u.email === email))
    return res.status(409).json({ ok: false, message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: crypto.randomUUID(), // UNIQUE ID
    username,
    email,
    passwordHash,
    role: "user",
    profile: { child: null, caregiverRole: "Parent" },
  };

  users.push(user);

  // ✅ seed logs for this user immediately (optional but nice)
  ensureUserLogs(user.id);

  res.json({
    ok: true,
    message: "Registered",
    user: { id: user.id, username, email, role: user.role },
  });
});

// Login (capital route kept)
app.post("/api/Login", (req, res, next) => {
  console.log("LOGIN BODY:", req.body);

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ ok: false, message: info?.message || "Login failed" });

    req.logIn(user, (err2) => {
      if (err2) return next(err2);

      // ✅ ensure logs exist for this user (admin + normal users)
      ensureUserLogs(user.id);

      res.json({
        ok: true,
        message: "Logged in",
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      });
    });
  })(req, res, next);
});

// Logout (capital route kept)
app.post("/api/Logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true, message: "Logged out" });
    });
  });
});

// Auth status
app.get("/api/auth/status", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      caregiverRole: req.user.caregiverRole || "Parent",
    },
  });
});

// ✅ Get logs for the logged-in user
app.get("/api/Logs", requireAuth, (req, res) => {
  const userId = req.user.id;
  const logs = ensureUserLogs(userId);
  res.json({ ok: true, logs });
});

// ✅ Add a new log for the logged-in user (simulate AI later)
app.post("/api/Logs", requireAuth, (req, res) => {
  const userId = req.user.id;
  const logs = ensureUserLogs(userId);

  const incoming = req.body || {};
  const newLog = {
    id: Date.now(),
    time: incoming.time || "00:00",
    date: incoming.date || new Date().toDateString(),
    type: incoming.type || "Unknown",
    emotion: incoming.emotion || "Unknown",
    confidence: typeof incoming.confidence === "number" ? incoming.confidence : 0.5,
    image: incoming.image || "",
    details: incoming.details || "",
  };

  logs.unshift(newLog);
  res.json({ ok: true, message: "Log added", log: newLog });
});

app.get("/api/Admin/Users", requireAdmin, (req, res) => {
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  res.json({ ok: true, users: safeUsers });
});

app.delete("/api/Admin/Users/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ ok: false, message: "User not found" });
  }

  if (req.user.id === id) {
    return res.status(400).json({ ok: false, message: "Cannot delete your own admin account" });
  }

  users.splice(index, 1);

  // optional cleanup: delete their logs too
  delete logsByUserId[id];

  res.json({ ok: true, message: "User deleted" });
});

// ✅ Profile Endpoints
app.get("/api/Profile", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ ok: false, message: "User not found" });
  res.json({ ok: true, profile: user.profile || { child: null, caregiverRole: "Parent" }, username: user.username });
});

app.put("/api/Profile/Child", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ ok: false, message: "User not found" });
  if (!user.profile) user.profile = { child: null, caregiverRole: "Parent" };
  user.profile.child = req.body.child;
  res.json({ ok: true, child: user.profile.child });
});

app.put("/api/Profile/Caregiver", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ ok: false, message: "User not found" });
  if (!user.profile) user.profile = { child: null, caregiverRole: "Parent" };

  if (req.body.caregiverRole) user.profile.caregiverRole = req.body.caregiverRole;
  if (req.body.username) user.username = req.body.username; // update name

  res.json({ ok: true, caregiverRole: user.profile.caregiverRole, username: user.username });
});

// Change password
app.put("/api/Profile/Password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: "Missing fields" });
  }

  // Basic rule (optional)
  if (newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: "Password must be at least 6 characters" });
  }

  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: "User not found" });

  const user = users[idx];

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, message: "Current password is incorrect" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);

  return res.json({ ok: true, message: "Password updated successfully" });
});



const PORT = 5000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));