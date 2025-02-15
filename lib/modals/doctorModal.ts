import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    phone: { type: String, required: true }, // Moved to root level
    email: { type: String, unique: true, sparse: true }, // Moved to root level
    hospitalId: { type: String, required: true },
    ratings: {
      average: { type: Number, default: 0, min: 0 },
      reviews: { type: Number, default: 0, min: 0 },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    availableSlots: {
      type: [
        {
          startTime: { type: Date, required: true },
          endTime: { type: Date, required: true },
        },
      ],
      validate: {
        validator: function (value: any[]) {
          return value.length > 0; // Ensure at least one slot is present
        },
        message: "At least one available slot is required.",
      },
    },
    image: { type: String, default: "" },
  },
  { collection: "doctors", timestamps: true }
);

// Add indexes
DoctorSchema.index({ hospitalId: 1 });
DoctorSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);