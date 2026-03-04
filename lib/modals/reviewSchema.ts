import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    appointmentId: { type: String, required: true, unique: true }, // one review per appointment
    rating: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ patientId: 1 });
reviewSchema.index({ appointmentId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
