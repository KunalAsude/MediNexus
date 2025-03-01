import mongoose from "mongoose";

// Define days of the week
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Define a schema for time slots
const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Storing as string for easier handling
  endTime: { type: String, required: true },   // Format: "HH:MM"
}, { _id: false });

// Define a schema for weekly availability
const WeeklyAvailabilitySchema = new mongoose.Schema({
  monday: { type: [TimeSlotSchema], default: [] },
  tuesday: { type: [TimeSlotSchema], default: [] },
  wednesday: { type: [TimeSlotSchema], default: [] },
  thursday: { type: [TimeSlotSchema], default: [] },
  friday: { type: [TimeSlotSchema], default: [] },
  saturday: { type: [TimeSlotSchema], default: [] },
  sunday: { type: [TimeSlotSchema], default: [] },
}, { _id: false });

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    phone: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    hospitalId: { type: String, required: true },
    ratings: {
      average: { type: Number, default: 0, min: 0 },
      reviews: { type: Number, default: 0, min: 0 },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    
    // Legacy field - keeping but phasing out
    availableSlots: {
      type: [
        {
          startTime: { type: Date, required: true },
          endTime: { type: Date, required: true },
        },
      ],
      default: [],
    },
    
    // Main field for weekly recurring availability
    weeklyAvailability: {
      type: WeeklyAvailabilitySchema,
      default: () => {
        // Create default empty slots for each day
        const defaultAvailability = {};
        DAYS_OF_WEEK.forEach(day => {
          defaultAvailability[day] = [];
        });
        return defaultAvailability;
      },
    },
    
    // Field to store specific date exceptions (holidays, special hours)
    dateSpecificSlots: {
      type: Map,
      of: [TimeSlotSchema],
      default: new Map(),
    },
    
    image: { type: String, default: "" },
  },
  { collection: "doctors", timestamps: true }
);

// Add indexes
DoctorSchema.index({ hospitalId: 1 });
DoctorSchema.index({ email: 1 }, { unique: true, sparse: true });

// Validate that at least one day has availability if status is active
DoctorSchema.path('weeklyAvailability').validate(function(value) {
  if (this.status === 'active') {
    // Check if at least one day has slots
    return DAYS_OF_WEEK.some(day => value[day] && value[day].length > 0);
  }
  return true;
}, 'At least one day must have available slots when status is active.');

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);