import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Copies taken at booking time, so the record stays accurate even if the
    // provider later renames a service or changes its price.
    providerName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },

    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:mm", 24-hour

    duration: { type: Number, required: true },
    price: { type: Number, required: true },

    notes: { type: String, default: "", trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },

    cancelledBy: {
      type: String,
      enum: ["customer", "provider", null],
      default: null,
    },

    statusUpdatedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
