import mongoose from 'mongoose';

/**
 * User Schema
 * Represents a museum visitor with preferences and favorites
 */
const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false  // Don't return password in queries by default
  },
  avatar: {
    type: String,
    required: false,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: [{
    type: String
  }],
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibit'
  }],
  ratings: {
    type: Map,
    of: Number
  },
  personalizationAvailable: {
    type: Boolean,
    default: false
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
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
