import mongoose from "mongoose";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";
import SlotLock from "../models/SlotLock.js";
import { buildSlots, dateProblem, nowInTimezone } from "../utils/time.js";

const publicProvider = (p) => ({
  id: p._id,
  name: p.name,
  category: p.category,
  bio: p.bio,
  location: p.location,
  phone: p.phone,
  email: p.email,
  workingDays: p.workingDays,
  workingHours: p.workingHours,
  breakTime: p.breakTime,
  slotInterval: p.slotInterval,
});

const findActiveProvider = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const provider = await Provider.findById(id).lean();
  return provider && provider.isActive ? provider : null;
};

// GET /api/providers
export const listProviders = async (req, res) => {
  const providers = await Provider.find({ isActive: true }).sort({ name: 1 }).lean();
  res.status(200).json({ success: true, providers: providers.map(publicProvider) });
};

// GET /api/providers/:id - profile plus the services it offers.
export const getProvider = async (req, res) => {
  const provider = await findActiveProvider(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, message: "Provider not found" });
  }

  const services = await Service.find({ provider: provider._id, isActive: true })
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    provider: {
      ...publicProvider(provider),
      services: services.map((s) => ({
        id: s._id,
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
      })),
    },
  });
};

// GET /api/providers/:id/availability?date=YYYY-MM-DD&serviceId=...
export const getAvailability = async (req, res) => {
  const { date, serviceId } = req.query;

  const provider = await findActiveProvider(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, message: "Provider not found" });
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    return res.status(400).json({ success: false, message: "Please choose a service" });
  }

  const service = await Service.findOne({ _id: serviceId, provider: provider._id, isActive: true }).lean();
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found for this provider" });
  }

  const now = nowInTimezone();
  const problem = dateProblem(provider, date, now);
  if (problem) {
    return res.status(200).json({ success: true, date, open: false, message: problem, slots: [] });
  }

  const locks = await SlotLock.find({ provider: provider._id, date }).select("cell").lean();
  const slots = buildSlots({
    provider,
    duration: service.duration,
    date,
    locked: new Set(locks.map((l) => l.cell)),
    now,
  });

  res.status(200).json({
    success: true,
    date,
    open: true,
    message: slots.length ? null : "No times left on this day. Please choose another date.",
    slots,
  });
};
