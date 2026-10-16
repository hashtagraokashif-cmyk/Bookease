import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";
import SlotLock from "../models/SlotLock.js";
import {
  buildSlots,
  dateProblem,
  isValidTimeString,
  nowInTimezone,
  occupiedCells,
  to12Hour,
  toMinutes,
} from "../utils/time.js";

const ACTIVE = ["Pending", "Confirmed"];

const toClient = (a) => {
  const plain = typeof a.toObject === "function" ? a.toObject() : a;
  return {
    ...plain,
    id: plain._id,
    timeLabel: to12Hour(plain.time),
  };
};

const hasStarted = (appointment, now = nowInTimezone()) =>
  appointment.date < now.date ||
  (appointment.date === now.date && toMinutes(appointment.time) <= now.minutes);

const isDuplicateKey = (error) =>
  error?.code === 11000 || error?.writeErrors?.some?.((w) => (w.code ?? w.err?.code) === 11000);

// ==============================
// CREATE APPOINTMENT
// POST /api/appointments  { serviceId, date, time, notes }
// ==============================
export const createAppointment = async (req, res) => {
  const { serviceId, date, time } = req.body;
  const notes = String(req.body.notes || "").trim().slice(0, 500);

  if (!serviceId || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "Please choose a service, date and time",
    });
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  if (!isValidTimeString(time)) {
    return res.status(400).json({ success: false, message: "Please choose a valid time" });
  }

  // Price, duration and provider always come from the database - never from
  // the browser - so they cannot be tampered with.
  const service = await Service.findOne({ _id: serviceId, isActive: true }).lean();
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  const provider = await Provider.findById(service.provider).lean();
  if (!provider || !provider.isActive) {
    return res.status(404).json({ success: false, message: "This provider is not taking bookings" });
  }

  const now = nowInTimezone();
  const problem = dateProblem(provider, date, now);
  if (problem) {
    return res.status(400).json({ success: false, message: problem });
  }

  // The time must be one of the provider's real start times for this service:
  // on the grid, inside working hours, outside the break and not already past.
  const validStart = buildSlots({ provider, duration: service.duration, date, now }).some(
    (slot) => slot.time === time
  );
  if (!validStart) {
    return res.status(400).json({
      success: false,
      message: "That time is not available for this service. Please choose another slot.",
    });
  }

  // A customer cannot be in two places at once.
  const start = toMinutes(time);
  const end = start + service.duration;
  const sameDay = await Appointment.find({
    customer: req.user._id,
    date,
    status: { $in: ACTIVE },
  }).lean();
  const clash = sameDay.find((a) => {
    const aStart = toMinutes(a.time);
    return start < aStart + a.duration && end > aStart;
  });
  if (clash) {
    return res.status(409).json({
      success: false,
      message: `You already have ${clash.serviceName} with ${clash.providerName} at ${to12Hour(clash.time)} that day.`,
    });
  }

  // Claim every time block this appointment covers. The unique index on
  // SlotLock means only one booking can ever win a given block.
  const appointmentId = new mongoose.Types.ObjectId();
  const cells = occupiedCells(start, service.duration, provider.slotInterval || 30);

  try {
    await SlotLock.insertMany(
      cells.map((cell) => ({ provider: provider._id, date, cell, appointment: appointmentId })),
      { ordered: true }
    );
  } catch (error) {
    await SlotLock.deleteMany({ appointment: appointmentId });
    if (isDuplicateKey(error)) {
      return res.status(409).json({
        success: false,
        message: "Sorry, that time was just booked by someone else. Please choose another slot.",
      });
    }
    throw error;
  }

  try {
    const appointment = await Appointment.create({
      _id: appointmentId,
      customer: req.user._id,
      provider: provider._id,
      service: service._id,
      providerName: provider.name,
      category: provider.category,
      serviceName: service.name,
      location: provider.location,
      date,
      time,
      duration: service.duration,
      price: service.price,
      notes,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment request created successfully",
      appointment: toClient(appointment),
    });
  } catch (error) {
    // Never leave a time blocked by an appointment that failed to save.
    await SlotLock.deleteMany({ appointment: appointmentId });
    throw error;
  }
};

// ==============================
// MY APPOINTMENTS (customer)
// GET /api/appointments/my
// ==============================
export const getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ customer: req.user._id })
    .sort({ date: 1, time: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments: appointments.map(toClient),
  });
};

// ==============================
// PROVIDER'S APPOINTMENTS
// GET /api/appointments/provider
// ==============================
export const getProviderAppointments = async (req, res) => {
  if (!req.user.provider) {
    return res.status(403).json({
      success: false,
      message: "This account is not linked to a provider profile",
    });
  }

  const appointments = await Appointment.find({ provider: req.user.provider })
    .populate("customer", "name email phone")
    .sort({ date: 1, time: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments: appointments.map(toClient),
  });
};

// Customers see their own appointments; providers see appointments booked with them.
const findVisibleAppointment = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const appointment = await Appointment.findById(id);
  if (!appointment) return null;

  const isCustomer = appointment.customer.equals(user._id);
  const isProvider =
    user.role === "provider" && user.provider && appointment.provider.equals(user.provider);

  return isCustomer || isProvider ? { appointment, isCustomer, isProvider } : null;
};

// ==============================
// ONE APPOINTMENT
// GET /api/appointments/:id
// ==============================
export const getAppointment = async (req, res) => {
  const found = await findVisibleAppointment(req.params.id, req.user);
  if (!found) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }
  res.status(200).json({ success: true, appointment: toClient(found.appointment) });
};

// ==============================
// CHANGE STATUS
// PATCH /api/appointments/:id/status  { status }
//
// Customer: Pending/Confirmed -> Cancelled (before it starts)
// Provider: Pending -> Confirmed or Cancelled
//           Confirmed -> Cancelled, or Completed once it has started
// ==============================
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  const found = await findVisibleAppointment(req.params.id, req.user);
  if (!found) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  const { appointment, isProvider } = found;
  const current = appointment.status;
  const now = nowInTimezone();

  const deny = (message, code = 400) =>
    res.status(code).json({ success: false, message });

  if (!["Confirmed", "Cancelled", "Completed"].includes(status)) {
    return deny("Status must be Confirmed, Cancelled or Completed");
  }

  if (!isProvider) {
    // Customer
    if (status !== "Cancelled") return deny("Only the provider can confirm or complete an appointment", 403);
    if (!ACTIVE.includes(current)) return deny(`This appointment is already ${current.toLowerCase()}`);
    if (hasStarted(appointment, now)) return deny("This appointment has already started and can no longer be cancelled");
  } else {
    // Provider
    const allowed = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Cancelled", "Completed"],
    };
    if (!allowed[current]?.includes(status)) {
      return deny(`A ${current.toLowerCase()} appointment cannot be marked ${status.toLowerCase()}`);
    }
    if (status === "Completed" && !hasStarted(appointment, now)) {
      return deny("You can mark an appointment completed once its start time has passed");
    }
  }

  appointment.status = status;
  appointment.statusUpdatedAt = new Date();
  if (status === "Cancelled") appointment.cancelledBy = isProvider ? "provider" : "customer";
  await appointment.save();

  // A cancelled appointment frees its time for someone else.
  if (status === "Cancelled") {
    await SlotLock.deleteMany({ appointment: appointment._id });
  }

  const updated = isProvider
    ? await Appointment.findById(appointment._id).populate("customer", "name email phone").lean()
    : appointment;

  res.status(200).json({
    success: true,
    message: `Appointment ${status.toLowerCase()}`,
    appointment: toClient(updated),
  });
};
