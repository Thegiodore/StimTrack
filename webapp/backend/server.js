require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

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
    // password: "Admin123!",  // ❌ remove plain
    passwordHash: bcrypt.hashSync("Admin123!", 10), // ✅ hashed
    role: "admin",
  },
];
// Local strategy (email + password)
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      console.log("LOCAL STRATEGY:", { email, password });

      const user = users.find((u) => u.email === email);
      if (!user) return done(null, false, { message: "User not found" });
      if (user.password !== password)
        return done(null, false, { message: "Incorrect password" });
      return done(null, user);
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
    id: Date.now().toString(),
    username,
    email,
    passwordHash,
    role: "user",
  };

  users.push(user);

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
      res.json({ ok: true, message: "Logged in", user: { id: user.id, username: user.username, email: user.email, role: user.role } });
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

// Auth status (NOW works)
app.get("/api/auth/status", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: { id: req.user.id, username: req.user.username, email: req.user.email } });
});

app.get("/api/Admin/Users", requireAdmin, (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest);
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
  res.json({ ok: true, message: "User deleted" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));