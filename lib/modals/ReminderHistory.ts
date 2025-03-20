// models/ReminderHistory.ts
import mongoose, { Schema } from "mongoose";

const reminderHistorySchema = new Schema(
  {
    appointmentId: { type: String, required: true },
    lastSentAt: { type: Date, required: true },
    reminderCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

reminderHistorySchema.index({ appointmentId: 1 }, { unique: true });

const ReminderHistory = 
  mongoose.models.ReminderHistory || mongoose.model("ReminderHistory", reminderHistorySchema);

export default ReminderHistory;