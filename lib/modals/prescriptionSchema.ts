import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
  },
  doctorName: {  
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  appointmentId: {
    type: String,
    required: true, 
  },
  notes: {
    type: String,
  },
  prescriptions: [
    {
      medication: {
        type: String,
        required: true,
      },
      dosage: {
        type: String,
        required: true,
      },
      frequency: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      quantity: {
        type: String,
        required: true,
      },
      instructions: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
