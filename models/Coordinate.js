import mongoose from 'mongoose';

/**
 * Coordinate Schema
 * Represents user's current location
 */
const coordinateSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

coordinateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.timestamp = new Date();
  next();
});

const Coordinate = mongoose.model('Coordinate', coordinateSchema);

export default Coordinate;
