import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import SlotLock from "./models/SlotLock.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config({ quiet: true });

const app = express();


// ==============================
// MIDDLEWARE
// ==============================

// Allowed: this computer (any port - Vite moves to 5174 if 5173 is busy) and
// devices on your own Wi-Fi, such as your phone, which open the site at this
// computer's network address (192.168.x.x, 10.x.x.x or 172.16-31.x.x).
// Those addresses only exist inside local networks, never on the internet.
// Set CLIENT_URL when the frontend is deployed somewhere else.
const LOCAL_ORIGIN =
  /^http:\/\/(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):\d+$/;

// A page served by this same server (the one-service setup on Render) is
// always allowed: browsers still label its requests with an Origin header.
const isSameSite = (origin, req) => {
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin, req) =>
  !origin ||
  isSameSite(origin, req) ||
  LOCAL_ORIGIN.test(origin) ||
  (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");

    if (!isAllowedOrigin(origin, req)) {
      return callback(new Error("Origin is not allowed by CORS"));
    }

    return callback(null, { origin: true, credentials: true });
  })
);

app.use(express.json());


// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/appointments", appointmentRoutes);


// ==============================
// HEALTH CHECK
// ==============================

const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Appointment Booking System API is running",
  });
};

app.get("/api/health", healthCheck);


// ==============================
// WEBSITE
// ==============================

// Once the frontend has been built (npm run build), this server also serves
// the website itself, so the whole app runs as one service on one address.
// Without a build (e.g. local development, where Vite serves the pages),
// "/" just reports that the API is running.
const FRONTEND_DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "frontend", "dist");
const FRONTEND_INDEX = path.join(FRONTEND_DIST, "index.html");

if (fs.existsSync(FRONTEND_INDEX)) {
  // Built files. Names under /assets change with every build, so browsers can
  // keep them for a year; everything else is re-checked on each visit.
  app.use(
    express.static(FRONTEND_DIST, {
      index: false,
      setHeaders: (res, filePath) => {
        const isHashedAsset = filePath.includes(`${path.sep}assets${path.sep}`);
        res.setHeader(
          "Cache-Control",
          isHashedAsset ? "public, max-age=31536000, immutable" : "no-cache"
        );
      },
    })
  );

  // Every page address (/, /services, /providers/123, ...) loads the app,
  // which then shows the right page. API calls and missing files (anything
  // with a file extension) fall through to the 404 below instead.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || path.extname(req.path)) {
      return next();
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(FRONTEND_INDEX);
  });
} else {
  app.get("/", healthCheck);
}


// ==============================
// 404 + ERRORS
// ==============================

app.use(notFound);
app.use(errorHandler);


// ==============================
// SERVER
// ==============================

// 5050, not 5000: on Macs, AirPlay Receiver already uses port 5000.
const PORT = process.env.PORT || 5050;

export const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Copy backend/.env.example to backend/.env and set it.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    // Make sure the unique indexes exist before the first request uses them.
    await Promise.all([User.init(), SlotLock.init()]);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  }
};

// Start only when run directly (node server.js / nodemon), not when imported by tests.
const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer();
}

export default app;
