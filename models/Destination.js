import mongoose from 'mongoose';

/**
 * Destination Schema
 *
 * Purpose:
 * - Model a point of interest (exhibit, restroom, cafe, etc.) on a map
 * - Store coordinates, type, optional alternatives and suggested times
 *
 * Implementation notes:
 * - `destinationId` is a numeric stable identifier used in mock data tests
 * - A pre-save hook updates timestamps; this is only active in DB mode
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

// NOTE: Mongoose pre-save hook - only executes with MongoDB, not in mock data mode.
// Uncovered in tests that use mock data, but essential for MongoDB operation.
destinationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastUpdated = new Date();
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
