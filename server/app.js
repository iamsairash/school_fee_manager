import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { requireAuth } from "./auth.js";
import authRouter from "./routes/auth.js";
import studentsRouter from "./routes/students.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Hosts put a proxy in front of the app. Without this, every visitor looks like
// the same IP (breaking the login rate limit) and secure cookies can misbehave.
if (isProduction) app.set("trust proxy", 1);

app.use(helmet());

// A cookie needs an exact origin (not "*") plus credentials: true
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Public
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    database: connected ? "connected" : "disconnected",
  });
});
app.use("/api/auth", authRouter);

// Protected: requireAuth runs before every students route
app.use("/api/students", requireAuth, studentsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});
// Serve the built React app when SERVE_CLIENT=true (production / local production test)
if (process.env.SERVE_CLIENT === "true") {
  const clientDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../client/dist",
  );
  app.use(express.static(clientDist));
  // Any other GET goes to React, so reloading the page works
  app.use((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

export default app;
