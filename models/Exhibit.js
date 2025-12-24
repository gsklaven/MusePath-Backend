import mongoose from 'mongoose';

/**
 * Exhibit Schema
 *
 * Purpose:
 * - Represent exhibits with metadata, accessibility flags, ratings and media
 * - Designed to match fields used by services and mock data for tests
 *
 * Notes:
 * - `exhibitId` is a stable numeric identifier used in mock mode
 * - Pre-save hook keeps `updatedAt` current when persisting to MongoDB
 */
const exhibitSchema = new mongoose.Schema({
  // Unique numeric identifier for the exhibit
  exhibitId: {
    type: Number,
    required: true,
    unique: true
  },
  // Short name of the exhibit
  name: {
    type: String,
    required: true
  },
  // Full title of the exhibit
  title: {
    type: String,
    required: true
  },
  // Categories for classification and search (e.g., "Modern Art")
  category: [{
    type: String
  }],
  // Detailed description of the exhibit
  description: {
    type: String,
    required: true
  },
  // Historical context and background information
  historicalInfo: {
    type: String
  },
  // Physical location description (e.g., "Gallery A")
  location: {
    type: String,
    required: true
  },
  // Geographical coordinates
  coordinates: {
    lat: Number,
    lng: Number
  },
  // Operational status
  status: {
    type: String,
    enum: ['open', 'closed', 'under_maintenance'],
    default: 'open'
  },
  // Whether the exhibit allows visitors currently
  visitingAvailability: {
    type: Boolean,
    default: true
  },
  // User ratings map (UserId -> Rating)
  ratings: {
    type: Map,
    of: Number,
    default: new Map()
  },
  // Cached average rating for performance
  averageRating: {
    type: Number,
    default: 0
  },
  // Accessibility flag: Wheelchair access
  wheelchairAccessible: {
    type: Boolean,
    default: false
  },
  // Accessibility flag: Braille support
  brailleSupport: {
    type: Boolean,
    default: false
  },
  // URL to the audio guide media file
  audioGuideUrl: {
    type: String
  },
  // Search keywords
  keywords: [{
    type: String
  }],
  // List of features (e.g., "Interactive")
  features: [{
    type: String
  }],
  // Current crowd level
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
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
exhibitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Exhibit = mongoose.model('Exhibit', exhibitSchema);

export default Exhibit;
