import mongoose from "mongoose";

const timeRange = {
  start: { type: String, required: true }, // "HH:mm", 24-hour
  end: { type: String, required: true },
};

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    bio: { type: String, default: "", trim: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },

    // The login that manages this profile.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // 0 = Sunday ... 6 = Saturday
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
    workingHours: {
      type: new mongoose.Schema(timeRange, { _id: false }),
      default: () => ({ start: "09:00", end: "17:00" }),
    },
    breakTime: {
      type: new mongoose.Schema(timeRange, { _id: false }),
      default: () => ({ start: "13:00", end: "14:00" }),
    },
    // Appointments start on this grid, e.g. every 30 minutes.
    slotInterval: { type: Number, default: 30, min: 10 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;
