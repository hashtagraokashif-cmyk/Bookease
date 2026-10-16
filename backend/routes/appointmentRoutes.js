import express from "express";

import {
  createAppointment,
  getMyAppointments,
  getProviderAppointments,
  getAppointment,
  updateAppointmentStatus,
} from "../controllers/AppointmentController.js";

import protect, { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every appointment route needs a logged-in user.
router.use(protect);

// Book an appointment (customers only)
router.post("/", requireRole("customer"), createAppointment);

// The logged-in customer's appointments
router.get("/my", requireRole("customer"), getMyAppointments);

// Appointments booked with the logged-in provider
router.get("/provider", requireRole("provider"), getProviderAppointments);

// One appointment (its customer or its provider)
router.get("/:id", getAppointment);

// Confirm / cancel / complete
router.patch("/:id/status", updateAppointmentStatus);

export default router;
