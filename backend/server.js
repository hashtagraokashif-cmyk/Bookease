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

const isAllowedOrigin = (origin) =>
  !origin ||
  LOCAL_ORIGIN.test(origin) ||
  (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
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
// TEST ROUTE
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Appointment Booking System API is running",
  });
});


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
