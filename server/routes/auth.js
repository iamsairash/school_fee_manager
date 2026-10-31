import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from "../auth.js";

const router = Router();

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are real
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Only failed attempts count: 10 per 15 minutes per IP address (kept in memory)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// POST /api/auth/login   body: { email, password }
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    // Must be plain strings. An object like {"$gt": ""} would otherwise reach the database query.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      email.length > 120 ||
      password.length > 200
    ) {
      return res.status(400).json({ error: "Enter your email and password." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const ok = await bcrypt.compare(
      password,
      user ? user.passwordHash : DUMMY_HASH,
    );

    // Same message for "no such email" and "wrong password"
    if (!user || !ok)
      return res.status(401).json({ error: "Invalid email or password." });

    setAuthCookie(res, signToken(user.id));
    res.json({ email: user.email });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ status: "ok" });
});

// GET /api/auth/me  (used by the page on load to find out who is logged in)
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: "Please log in." });
    }
    res.json({ email: user.email });
  } catch (err) {
    next(err);
  }
});

export default router;
