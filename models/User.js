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
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
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

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
