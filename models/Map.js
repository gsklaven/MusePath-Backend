import mongoose from 'mongoose';

/**
 * Map Schema
 * Represents a museum floor map
 */
const mapSchema = new mongoose.Schema({
  mapId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  mapData: {
    type: String,
    required: true
  },
  mapUrl: {
    type: String,
    required: true
  },
  format: {
    type: String,
    default: 'png'
  },
  zoom: {
    type: Number,
    default: 1
  },
  rotation: {
    type: Number,
    default: 0
  },
  floor: {
    type: Number,
    default: 1
  },
  isOfflineAvailable: {
    type: Boolean,
    default: true
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
mapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Map = mongoose.model('Map', mapSchema);

export default Map;
