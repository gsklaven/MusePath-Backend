import User from '../models/User.js';
import { isMockDataMode } from '../config/database.js';
import { mockUsers } from '../data/mockData.js';
import { findExhibitObjectId, now } from '../utils/helpers.js';

/**
 * User Service
 * This service manages all business logic related to user data, including fetching user information,
 * managing preferences, and handling user-exhibit interactions like favorites.
 */

/**
 * Retrieves a user by their unique user ID.
 *
 * @param {number} userId - The ID of the user to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the user object, or null if not found.
 */
export const getUserById = async (userId) => {
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    const user = mockUsers.find(u => u.userId === Number(userId));
    return user || null;
  }
  
  // --- MONGODB MODE ---
  return await User.findOne({ userId: Number(userId) });
};

/**
 * Retrieves all users from the system.
 * NOTE: This function is currently unused as no endpoint calls it. It could be purposed for future admin functionality.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of all user objects.
 */
export const getAllUsers = async () => {
  if (isMockDataMode()) {
    return mockUsers;
  }
  
  return await User.find();
};

/**
 * Creates a new user.
 * This is a simplified user creation method; for registration with password hashing, see `authService.registerUser`.
 *
 * @param {Object} userData - The data for the new user.
 * @returns {Promise<Object>} A promise that resolves to the newly created user object.
 */
export const createUser = async (userData) => {
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    const newUser = {
      userId: mockUsers.length + 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  }
  
  // --- MONGODB MODE ---
  const user = new User(userData);
  return await user.save();
};

/**
 * Updates a user's preferences and enables the personalization feature for them.
 *
 * @param {number} userId - The ID of the user to update.
 * @param {Object} preferences - An object containing the user's new preferences.
 * @param {Array<string>} [preferences.interests] - An array of the user's interests.
 * @returns {Promise<Object|null>} A promise that resolves to the updated user object, or null if the user was not found.
 */
export const updateUserPreferences = async (userId, preferences) => {
  // Normalize and sanitize the interests array to avoid injecting unexpected objects/operators.
  let normalizedInterests = [];
  if (preferences && Array.isArray(preferences.interests)) {
    normalizedInterests = preferences.interests
      .map((interest) => String(interest).trim())
      .filter((interest) => interest.length > 0);
  }

  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      user.preferences = normalizedInterests;
      user.personalizationAvailable = true; // Enable personalization once preferences are set.
      user.updatedAt = new Date();
    }
    return user;
  }
  
  // --- MONGODB MODE ---
  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    {
      preferences: normalizedInterests,
      personalizationAvailable: true,
      updatedAt: new Date()
    },
    { new: true } // Return the modified document.
  );
};

/**
 * Adds an exhibit to a user's list of favorites.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} exhibitId - The public-facing ID of the exhibit to add.
 * @returns {Promise<Object|null>} A promise that resolves to the updated user object.
 */
export const addFavorite = async (userId, exhibitId) => {
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      // Ensure the exhibit is not already in favorites to prevent duplicates.
      if (!user.favourites.includes(exhibitId)) {
        user.favourites.push(exhibitId);
        user.updatedAt = new Date();
      }
    }
    return user;
  }

  // --- MONGODB MODE ---
  // In MongoDB, favorites are stored as an array of Exhibit ObjectIds.
  // We must first find the exhibit's internal _id to store the reference correctly.
  const exhibitObjectId = await findExhibitObjectId(exhibitId);
  if (!exhibitObjectId) return null; // Return null if the exhibit doesn't exist.

  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    {
      $addToSet: { favourites: exhibitObjectId }, // `$addToSet` prevents adding duplicates.
      updatedAt: now()
    },
    { new: true }
  );
};

/**
 * Removes an exhibit from a user's list of favorites.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} exhibitId - The public-facing ID of the exhibit to remove.
 * @returns {Promise<Object|null>} A promise that resolves to the updated user object.
 */
export const removeFavorite = async (userId, exhibitId) => {
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    const user = mockUsers.find(u => u.userId === Number(userId));
    if (user) {
      user.favourites = user.favourites.filter(id => id !== exhibitId);
      user.updatedAt = new Date();
    }
    return user;
  }

  // --- MONGODB MODE ---
  // First, find the internal _id of the exhibit to remove it from the user's favorites array.
  const exhibitObjectId = await findExhibitObjectId(exhibitId);
  if (!exhibitObjectId) {
    // If the exhibit to be removed doesn't exist, we can treat the operation as successful but a no-op.
    // This makes the endpoint idempotent. We still update the timestamp.
    return await User.findOneAndUpdate(
      { userId: Number(userId) },
      { updatedAt: now() },
      { new: true }
    );
  }

  return await User.findOneAndUpdate(
    { userId: Number(userId) },
    {
      $pull: { favourites: exhibitObjectId }, // `$pull` removes all instances of the value from the array.
      updatedAt: now()
    },
    { new: true }
  );
};

