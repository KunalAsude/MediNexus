import mongoose, { Schema, Document } from "mongoose";

// Define the Appointment Schema
const appointmentSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true, // The patientId must be provided
  },
  patientName: {
    type: String,
    required: true,
  },
  primaryPhysician: {
    type: String,
    required: true, // The primary physician is required
  },
  reason: {
    type: String,
    required: true, // Reason for the appointment
  },
  schedule: {
    type: Date,
    required: true, // The appointment's scheduled time
  },
  status: {
    type: String,
    enum: ["pending", "scheduled", "cancelled"],
    default: "pending", // Default status is "pending"
  },
  note: {
    type: String,
    default: "", // Default to empty string if no note is provided
  },
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt fields

// Ensure the model is not redefined if already compiled
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;
