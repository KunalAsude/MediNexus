// File: /lib/models/emergency.js
import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: false,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: false,
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  deviceInfo: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'en_route', 'arrived', 'completed', 'cancelled'],
    default: 'pending',
  },
  responderId: {
    type: String,
    required: false,
  },
  responderName: {
    type: String,
    required: false,
  },
  estimatedArrival: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
  }
});


const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);

export default Emergency;