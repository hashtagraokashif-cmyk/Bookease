import Service from "../models/Service.js";

// GET /api/services - every bookable service, with the provider it belongs to.
export const listServices = async (req, res) => {
  const services = await Service.find({ isActive: true })
    .populate("provider", "name category location isActive")
    .sort({ createdAt: 1 })
    .lean();

  const bookable = services
    .filter((s) => s.provider && s.provider.isActive)
    .map((s) => ({
      id: s._id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      provider: {
        id: s.provider._id,
        name: s.provider.name,
        category: s.provider.category,
        location: s.provider.location,
      },
    }));

  res.status(200).json({ success: true, count: bookable.length, services: bookable });
};
