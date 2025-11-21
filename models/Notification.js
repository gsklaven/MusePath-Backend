import mongoose from 'mongoose';

/**
 * Notification Schema
 * Represents notifications sent to users
 */
const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: Number,
    required: true
  },
  routeId: {
    type: Number
  },
  type: {
    type: String,
    required: true,
    enum: ['route_deviation', 'arrival', 'destination_closed', 'crowd_alert', 'info']
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
