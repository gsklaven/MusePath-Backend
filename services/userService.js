import User from '../models/User.js';
import { isMockDataMode } from '../config/database.js';
import { mockUsers } from '../data/mockData.js';

/**
 * User Service
 * Business logic for user operations
 */

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 */
export const getUserById = async (userId) => {
  if (isMockDataMode()) {
    const user = mockUsers.find(u => u.userId === Number(userId));
    return user || null;
  }
  
  return await User.findOne({ userId: Number(userId) });
};

/**
 * Get all users
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async () => {
  if (isMockDataMode()) {
    return mockUsers;
  }
  
  return await User.find();
};

/**
 * Create user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  if (isMockDataMode()) {
    const newUser = {
      userId: mockUsers.length + 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  }
  
  const user = new User(userData);
  return await user.save();
};

/**
 * Update user preferences
 * @param {number} userId - User ID
 * @param {Object} preferences - Preferences data
 * @returns {Promise<Object>} Updated user
 */
export const updateUserPreferences = async (userId, preferences) => {
  // Defensive checks to avoid runtime errors
  const safeInterests =
    preferences && typeof preferences === 'object' && Array.isArray(preferences.interests)
      ? preferences.interests
      : [];

  if (isMockDataMode()) {
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      user.preferences = safeInterests;
      user.personalizationAvailable = true;
      user.updatedAt = new Date();
    }
    return user;
  }

  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    {
      preferences: safeInterests,
      personalizationAvailable: true,
      updatedAt: new Date()
    },
    { new: true }
  );
};

/**
 * Add exhibit to favorites
 * @param {number} userId - User ID
 * @param {number} exhibitId - Exhibit ID
 * @returns {Promise<Object>} Updated user
 */
export const addFavorite = async (userId, exhibitId) => {
  if (isMockDataMode()) {
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      if (!user.favourites.includes(exhibitId)) {
        user.favourites.push(exhibitId);
        user.updatedAt = new Date();
      }
    }
    return user;
  }
  
  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    { 
      $addToSet: { favourites: exhibitId },
      updatedAt: new Date()
    },
    { new: true }
  );
};

/**
 * Remove exhibit from favorites
 * @param {number} userId - User ID
 * @param {number} exhibitId - Exhibit ID
 * @returns {Promise<Object>} Updated user
 */
export const removeFavorite = async (userId, exhibitId) => {
  if (isMockDataMode()) {
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      user.favourites = user.favourites.filter(id => id !== exhibitId);
      user.updatedAt = new Date();
    }
    return user;
  }
  
  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    { 
      $pull: { favourites: exhibitId },
      updatedAt: new Date()
    },
    { new: true }
  );
};
