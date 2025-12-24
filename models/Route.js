import mongoose from 'mongoose';

/**
 * Route Schema
 * Represents a calculated route between points
 */
const routeSchema = new mongoose.Schema({
  // Unique numeric identifier for the route
  routeId: {
    type: Number,
    required: true,
    unique: true
  },
  // ID of the user who requested the route
  userId: {
    type: Number,
    required: true
  },
  // ID of the target destination
  destinationId: {
    type: Number,
    required: true
  },
  // Starting point coordinates
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
  // Ending point coordinates (usually matches destination coordinates)
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
  // Array of coordinate points forming the route path
  path: [{
    lat: Number,
    lng: Number
  }],
  // Textual navigation instructions
  instructions: [{
    type: String
  }],
  // Intermediate stops along the route
  stops: [{
    destinationId: Number,
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  // Total distance in meters
  distance: {
    type: Number,
    required: true
  },
  // Estimated time in seconds
  estimatedTime: {
    type: Number,
    required: true
  },
  // Formatted arrival time string
  arrivalTime: {
    type: String
  },
  // Time taken to calculate the route (performance metric)
  calculationTime: {
    type: Number,
    default: 0
  },
  // Flag for personalized routes based on preferences
  isPersonalized: {
    type: Boolean,
    default: false
  },
  // URL to a static map image of the route
  mapUrl: {
    type: String
  },
  // Record creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Record last update timestamp
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
