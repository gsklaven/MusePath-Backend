import mongoose from 'mongoose';

/**
 * Route Schema
 * 
 * This schema defines the structure for a route document in the database. A route represents a calculated
 * path between a starting point and a destination, potentially including intermediate stops, navigation
 * instructions, and time/distance estimates.
 */
const routeSchema = new mongoose.Schema({
  // The public-facing unique identifier for the route.
  routeId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  // The numeric ID of the user who requested or owns this route.
  userId: {
    type: Number,
    required: true
  },
  // The numeric ID of the primary destination for this route.
  destinationId: {
    type: Number,
    required: true
  },
  // The geographical coordinates of the route's starting point.
  startCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // The geographical coordinates of the route's final destination.
  endCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // An ordered array of coordinate points that form the visual path of the route.
  path: [{
    lat: Number,
    lng: Number
  }],
  // An array of human-readable, turn-by-turn navigation instructions.
  instructions: [{
    type: String
  }],
  // An array of intermediate stops or points of interest along the route.
  stops: [{
    destinationId: Number,
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  // The total calculated distance of the route, typically in meters.
  distance: {
    type: Number,
    required: true
  },
  // The total estimated time to complete the route, typically in seconds.
  estimatedTime: {
    type: Number,
    required: true
  },
  // A formatted string representing the estimated time of arrival.
  arrivalTime: {
    type: String
  },
  // The time taken by the server to calculate the route, stored as a performance metric (in ms or s).
  calculationTime: {
    type: Number,
    default: 0
  },
  // A flag indicating whether the route was generated based on the user's personal preferences.
  isPersonalized: {
    type: Boolean,
    default: false
  },
  // A URL pointing to a static map image visualization of the route.
  mapUrl: {
    type: String
  },
  // Timestamp for when the route was created.
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp for when the route was last updated.
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose pre-save hook.
 * This function automatically updates the `updatedAt` field to the current timestamp
 * every time a route document is saved. This is crucial for tracking updates but is

 * only active when using MongoDB, not in mock data mode.
 */
routeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Route = mongoose.model('Route', routeSchema);

export default Route;
