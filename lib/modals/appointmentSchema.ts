import mongoose, { Schema } from "mongoose";

// Define the Appointment Schema
const appointmentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    primaryPhysician: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      image: { type: String },
    },
    reason: { type: String, required: true },

    // Time slot structure with start and end times
    timeSlot: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "scheduled", "cancelled"],
      default: "pending",
    },
    note: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for optimized queries
appointmentSchema.index({ "timeSlot.startTime": 1, "timeSlot.endTime": 1 });
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ "primaryPhysician.id": 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;