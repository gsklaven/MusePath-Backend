import mongoose from 'mongoose';

/**
 * Destination Schema
 * Represents a point of interest in the museum
 */
const destinationSchema = new mongoose.Schema({
  // Unique numeric identifier for the destination
  destinationId: {
    type: Number,
    required: true,
    unique: true
  },
  // Human-readable name of the destination (e.g., "Main Entrance")
  name: {
    type: String,
    required: true
  },
  // Category/Type of the destination for filtering and icons
  type: {
    type: String,
    required: true,
    enum: ['exhibit', 'restroom', 'exit', 'entrance', 'cafe', 'shop', 'information']
  },
  // Geographical coordinates (Latitude/Longitude)
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
  // Reference to the Map ID this destination belongs to
  mapId: {
    type: Number,
    required: true
  },
  // Operational status of the destination
  status: {
    type: String,
    enum: ['available', 'unavailable', 'closed'],
    default: 'available'
  },
  // Current crowd density level
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  // Timestamp of the last status/crowd update
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // List of alternative destination IDs if this one is closed/busy
  alternatives: [{
    type: Number
  }],
  // Recommended visiting times to avoid crowds
  suggestedTimes: [{
    type: String
  }],
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
destinationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastUpdated = new Date();
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
