import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { mockUsers } from '../data/mockData.js';
import { isMockDataMode } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret, BCRYPT_SALT_ROUNDS } from '../config/constants.js';
import { logoutUser as logoutUserToken, revokeToken as revokeTokenService, isTokenRevoked as isTokenRevokedService } from './tokenService.js';

/**
 * Custom error class for service-level errors.
 * This allows for returning specific HTTP status codes from the service layer.
 * @extends Error
 */
class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

/**
 * Handles user registration, login, and authentication logic.
 * This service abstracts away the data source (mock data or MongoDB) and provides a consistent interface for authentication-related operations.
 */

/**
 * Registers a new user in the system.
 * It hashes the password and then, based on the application's mode, either adds the user to a mock dataset or saves them to the database.
 * 
 * @param {Object} userData - The user's registration data.
 * @param {string} userData.username - The chosen username.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The user's plain text password.
 * @returns {Promise<Object>} A promise that resolves to the newly created user object, excluding the password.
 * @throws {ServiceError} Throws an error if the user already exists or if user creation fails.
 */
export const registerUser = async ({ username, email, password }) => {
  // Hash the password for secure storage.
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    // Check if a user with the same email or username already exists.
    const existingUser = mockUsers.find(
      u => u.email === email || u.username === username
    );

    if (existingUser) {
      throw new ServiceError('User already exists', 409); // 409 Conflict
    }

    // Create a new user object that adheres to the User schema.
    const newUser = {
      userId: mockUsers.length + 1,
      username,
      email,
      password: hashedPassword,
      avatar: null,
      role: 'user', // Assign a default role.
      preferences: [],
      favourites: [],
      ratings: new Map(),
      personalizationAvailable: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    // Return the user object without the password.
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } else {
    // --- MONGODB MODE ---
    // Check if a user with the same email or username already exists in the database.
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ServiceError('User already exists', 409); // 409 Conflict
    }

    // The following block attempts to create a user with a unique `userId`.
    // A retry loop is used to prevent rare race conditions where concurrent operations might assign the same `userId`.
    const maxAttempts = 5;
    let created = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidateId = await getNextUserId();
      try {
        const newUser = await User.create({
          userId: candidateId,
          username,
          email,
          password: hashedPassword
        });
        created = newUser;
        break; // Exit loop on success
      } catch (err) {
        // If it's a duplicate key error on `userId`, we'll retry. Otherwise, re-throw the error.
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.userId) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 20)); // Small delay before retrying
          continue;
        }
        throw err;
      }
    }

    if (!created) {
      // As a final fallback, generate a high-entropy userId to minimize collision probability,
      // especially in rapid test environments.
      const fallbackId = Date.now() % 1000000000 + Math.floor(Math.random() * 10000);
      try {
        const finalUser = await User.create({
          userId: fallbackId,
          username,
          email,
          password: hashedPassword
        });
        created = finalUser;
      } catch (finalErr) {
        throw new ServiceError('Failed to create user after multiple attempts', 500);
      }
    }

    // Convert the Mongoose document to a plain object and remove the password.
    const userObject = created.toObject();
    delete userObject.password;
    return userObject;
  }
};

/**
 * Authenticates a user and provides a JWT token upon successful login.
 * 
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.username - The username to authenticate.
 * @param {string} credentials.password - The plain text password to verify.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user details (without password) and a JWT token.
 * @throws {Error} Throws an "Invalid credentials" error if authentication fails.
 */
export const loginUser = async ({ username, password }) => {
  if (isMockDataMode()) {
    // Mock data mode
    const user = mockUsers.find(u => u.username === username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    // Generate JWT token
    const jwtSecret = getJwtSecret();
    const tokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const subject = userWithoutPassword.userId ?? userWithoutPassword._id ?? userWithoutPassword.id;
    const token = jwt.sign({ 
      sub: String(subject), 
      username: userWithoutPassword.username || null,
      role: userWithoutPassword.role || 'user'
    }, jwtSecret, { expiresIn: tokenExpiry });

    return { user: userWithoutPassword, token };
  } else {
    // MongoDB mode - explicitly select password for comparison
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Convert to object and remove password
    const userObject = user.toObject();
    delete userObject.password;
    // Generate JWT token
    const jwtSecret = getJwtSecret();
    const tokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const subject = userObject.userId ?? userObject._id ?? userObject.id;
    const token = jwt.sign({ 
      sub: String(subject), 
      username: userObject.username || null,
      role: userObject.role || 'user'
    }, jwtSecret, { expiresIn: tokenExpiry });

    return { user: userObject, token };
  }
};

/**
 * Retrieves a user by their unique ID.
 * 
 * @param {number} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the user object (password excluded).
 * @throws {Error} Throws a "User not found" error if the user cannot be found.
 * 
 * NOTE: This function removes the password field for security.
 * Consider if userService.getUserById should also remove password,
 * as it currently returns hashed password for internal use.
 * TODO: Review password handling consistency across services
 */
export const getUserById = async (userId) => {
  if (isMockDataMode()) {
    const user = mockUsers.find(u => u.userId === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } else {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new Error('User not found');
    }

    return user.toObject();
  }
};

/**
 * Calculates the next available user ID for new users in MongoDB.
 * Finds the user with the highest `userId` and increments it.
 * @returns {Promise<number>} The next sequential userId. Returns 1 if no users exist.
 */
const getNextUserId = async () => {
  const lastUser = await User.findOne().sort({ userId: -1 });
  return lastUser ? lastUser.userId + 1 : 1;
};

// Re-exporting token management functions from tokenService to provide a unified auth interface.
export const logoutUser = logoutUserToken;
export const revokeToken = revokeTokenService;
export const isTokenRevoked = isTokenRevokedService;

export default {
  registerUser,
  loginUser,
  getUserById,
  logoutUser,
  revokeToken,
  isTokenRevoked
};
