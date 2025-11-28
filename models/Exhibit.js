import mongoose from 'mongoose';

/**
 * Exhibit Schema
 * Represents a museum exhibit with information and accessibility features
 */
const exhibitSchema = new mongoose.Schema({
  exhibitId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  historicalInfo: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'under_maintenance'],
    default: 'open'
  },
  visitingAvailability: {
    type: Boolean,
    default: true
  },
  ratings: {
    type: Map,
    of: Number,
    default: new Map()
  },
  averageRating: {
    type: Number,
    default: 0
  },
  wheelchairAccessible: {
    type: Boolean,
    default: false
  },
  brailleSupport: {
    type: Boolean,
    default: false
  },
  audioGuideUrl: {
    type: String
  },
  keywords: [{
    type: String
  }],
  features: [{
    type: String
  }],
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
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

exhibitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Exhibit = mongoose.model('Exhibit', exhibitSchema);

export default Exhibit;
