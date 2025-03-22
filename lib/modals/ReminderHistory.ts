// models/ReminderHistory.ts
import mongoose from 'mongoose';

const ReminderHistorySchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    index: true
  },
  lastSentAt: {
    type: Date,
    required: true
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  // Track which types of reminders have been sent
  reminderTypes: {
    type: [String],
    enum: ['24hour', '1hour', '15min'],
    default: []
  },
  // Track delivery status
  deliveryStatus: [{
    type: {
      type: String,
      enum: ['patient', 'doctor']
    },
    emailId: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'failed'],
      default: 'sent'
    },
    timestamp: Date,
    error: String
  }]
}, { timestamps: true });

// Compound index for efficient querying
ReminderHistorySchema.index({ appointmentId: 1, 'reminderTypes': 1 });

export default mongoose.models.ReminderHistory || 
  mongoose.model('ReminderHistory', ReminderHistorySchema);