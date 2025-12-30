import mongoose from 'mongoose';

/**
 * Exhibit Schema
 * 
 * This schema defines the structure for an exhibit document in the database. It is a comprehensive model
 * that includes descriptive metadata, location details, accessibility information, user ratings, and media links.
 * It is designed to be the single source of truth for all information related to a museum exhibit.
 */
const exhibitSchema = new mongoose.Schema({
  // A stable, public-facing numeric identifier for the exhibit, distinct from MongoDB's `_id`.
  exhibitId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  // The short, common name of the exhibit.
  name: {
    type: String,
    required: true
  },
  // The full, official title of the exhibit.
  title: {
    type: String,
    required: true
  },
  // An array of categories for classification and searching (e.g., "Modern Art", "History").
  category: [{
    type: String
  }],
  // A detailed, descriptive text about the exhibit.
  description: {
    type: String,
    required: true
  },
  // Additional historical context or background information.
  historicalInfo: {
    type: String
  },
  // A human-readable description of the exhibit's physical location (e.g., "Gallery A, West Wing").
  location: {
    type: String,
    required: true
  },
  // The precise geographical coordinates of the exhibit.
  coordinates: {
    lat: Number,
    lng: Number
  },
  // The current operational status of the exhibit.
  status: {
    type: String,
    enum: ['open', 'closed', 'under_maintenance'],
    default: 'open'
  },
  // A boolean indicating if the exhibit is currently open to visitors.
  visitingAvailability: {
    type: Boolean,
    default: true
  },
  // A map storing individual user ratings, mapping a user's ID to their given rating.
  ratings: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  // A cached, calculated average of all ratings to improve performance on retrieval.
  averageRating: {
    type: Number,
    default: 0
  },
  // Flag indicating if the exhibit has wheelchair access.
  wheelchairAccessible: {
    type: Boolean,
    default: false
  },
  // Flag indicating if the exhibit offers information in Braille.
  brailleSupport: {
    type: Boolean,
    default: false
  },
  // A URL pointing to an audio guide file for the exhibit.
  audioGuideUrl: {
    type: String
  },
  // An array of keywords for enhanced search functionality.
  keywords: [{
    type: String
  }],
  // A list of special features of the exhibit (e.g., "Interactive", "Audiovisual").
  features: [{
    type: String
  }],
  // An estimate of the current crowd density around the exhibit.
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  // Timestamp for when the exhibit document was created.
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp for when the exhibit document was last updated.
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose pre-save hook.
 * This function automatically updates the `updatedAt` field to the current timestamp
 * every time an exhibit document is saved. This is crucial for tracking updates but is
 * only active when using MongoDB, not in mock data mode.
 */
exhibitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Exhibit = mongoose.model('Exhibit', exhibitSchema);

export default Exhibit;
