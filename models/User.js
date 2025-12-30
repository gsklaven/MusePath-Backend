import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * This schema defines the structure for a user document in the database. It includes user credentials,
 * profile information, personalization settings like preferences and favorites, and metadata such as timestamps.
 */
const userSchema = new mongoose.Schema({
  // The public-facing unique identifier for the user.
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true // Index for faster queries
  },
  // The user's chosen username, must be unique.
  username: {
    type: String,
    required: true,
    unique: true
  },
  // The user's email address, used for communication and must be unique.
  email: {
    type: String,
    required: true,
    unique: true
  },
  // The user's hashed password.
  password: {
    type: String,
    required: true,
    select: false  // This ensures the password is not returned in query results by default, enhancing security.
  },
  // URL to the user's avatar image.
  avatar: {
    type: String,
    required: false,
    default: null
  },
  // The user's role, determining their permissions within the application.
  role: {
    type: String,
    enum: ['user', 'admin'], // Restricts the role to one of these two values.
    default: 'user'
  },
  // An array of strings representing the user's interests (e.g., "History", "Art").
  preferences: [{
    type: String
  }],
  // An array of references to exhibits that the user has marked as favorites.
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibit' // Creates a reference to the 'Exhibit' model.
  }],
  // A map to store user's ratings for exhibits, with exhibitId as the key and the rating as the value.
  ratings: {
    type: Map,
    of: Number
  },
  // A flag indicating whether the user has provided preferences and personalization can be enabled.
  personalizationAvailable: {
    type: Boolean,
    default: false
  },
  // Timestamp for when the user was created.
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp for when the user was last updated.
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose pre-save hook.
 * This function automatically updates the `updatedAt` field to the current timestamp
 * every time a user document is saved. This is crucial for tracking updates but is
 * only active when using MongoDB, not in mock data mode.
 */
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
