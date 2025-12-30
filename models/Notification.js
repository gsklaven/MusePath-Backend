import mongoose from 'mongoose';

/**
 * Valid notification types.
 */
const NOTIFICATION_TYPES = [
  'route_deviation', 'arrival', 'destination_closed', 
  'crowd_alert', 'info'
];

/**
 * Notification Schema
 * Represents notifications sent to users regarding route updates,
 * alerts, or general information.
 */
const notificationSchema = new mongoose.Schema({
  // Unique numeric identifier for the notification
  notificationId: {
    type: Number,
    required: true,
    unique: true
  },
  // ID of the user receiving the notification
  userId: {
    type: Number,
    required: true
  },
  // Optional ID of the route related to the notification
  routeId: {
    type: Number
  },
  // Type of notification for categorization and UI handling
  type: {
    type: String,
    required: true,
    enum: NOTIFICATION_TYPES
  },
  // The content/body of the notification message
  message: {
    type: String,
    required: true
  },
  // Flag indicating if the user has read the notification
  isRead: {
    type: Boolean,
    default: false
  },
  // Timestamp when the notification was created
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp when the notification was last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure updatedAt is updated on save
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
