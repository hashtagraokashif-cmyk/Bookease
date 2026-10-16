import mongoose from "mongoose";

/**
 * One document per time block an active appointment occupies.
 *
 * A 45-minute booking at 09:00 on a 30-minute grid claims "09:00" and "09:30".
 * The unique index makes the database itself refuse a second claim on the same
 * block, so two people can never end up booked into overlapping times - even if
 * they press "Confirm" at the same instant.
 */
const slotLockSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
    date: { type: String, required: true },
    cell: { type: String, required: true }, // "HH:mm"
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

slotLockSchema.index({ provider: 1, date: 1, cell: 1 }, { unique: true });

const SlotLock = mongoose.model("SlotLock", slotLockSchema);

export default SlotLock;
