import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, unique: true, sparse: true }, // ✅ sparse allows multiple nulls
    },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    ratings: {
      average: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { collection: "doctors" }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
