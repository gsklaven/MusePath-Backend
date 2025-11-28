import mongoose from 'mongoose';

/**
 * Destination Schema
 * Represents a point of interest in the museum
 */
const destinationSchema = new mongoose.Schema({
  destinationId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['exhibit', 'restroom', 'exit', 'entrance', 'cafe', 'shop', 'information']
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  mapId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'closed'],
    default: 'available'
  },
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  alternatives: [{
    type: Number
  }],
  suggestedTimes: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

destinationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastUpdated = new Date();
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
