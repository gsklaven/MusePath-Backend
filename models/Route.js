import mongoose from 'mongoose';

/**
 * Route Schema
 *
 * Purpose:
 * - Persist calculated routes including path, instructions and timing
 * - Used by route services in both mock and DB modes; fields are kept
 *   intentionally simple for deterministic test behavior
 *
 * Notes:
 * - `routeId` is a numeric stable identifier used throughout tests
 * - Pre-save hook updates `updatedAt`; not executed in mock mode
 */
const routeSchema = new mongoose.Schema({
  routeId: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: Number,
    required: true
  },
  destinationId: {
    type: Number,
    required: true
  },
  startCoordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  endCoordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  path: [{
    lat: Number,
    lng: Number
  }],
  instructions: [{
    type: String
  }],
  stops: [{
    destinationId: Number,
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  distance: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number,
    required: true
  },
  arrivalTime: {
    type: String
  },
  calculationTime: {
    type: Number,
    default: 0
  },
  isPersonalized: {
    type: Boolean,
    default: false
  },
  mapUrl: {
    type: String
  },
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
routeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Route = mongoose.model('Route', routeSchema);

export default Route;
