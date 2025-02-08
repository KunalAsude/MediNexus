import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema(
  {
    name: String,
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    departments: [String],
    facilities: [String],
    ratings: {
      average: Number,
      reviews: Number,
    },
    image: String,
    description: String,
    status: String,
  },
  { collection: "hospitals" }
);

export default mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);
