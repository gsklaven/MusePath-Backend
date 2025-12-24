import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { mockUsers } from '../data/mockData.js';
import { isMockDataMode } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret, BCRYPT_SALT_ROUNDS } from '../config/constants.js';
import { logoutUser as logoutUserToken, revokeToken as revokeTokenService, isTokenRevoked as isTokenRevokedService } from './tokenService.js';

// Simple service-level error with HTTP status
class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

/**
 * Authentication Service
 * Handles user registration, login, and authentication logic
 */

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password
 * @returns {Promise<Object>} Created user (without password)
 */
export const registerUser = async ({ username, email, password }) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  if (isMockDataMode()) {
    // Mock data mode - check if user exists
    const existingUser = mockUsers.find(
      u => u.email === email || u.username === username
    );

    if (existingUser) {
      throw new ServiceError('User already exists', 409);
    }

    // Create mock user following the User schema
    const newUser = {
      userId: mockUsers.length + 1,
      username,
      email,
      password: hashedPassword,
      avatar: null,
      role: 'user', // Default role
      preferences: [],
      favourites: [],
      ratings: new Map(),
      personalizationAvailable: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } else {
    // MongoDB mode - check existing user first
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ServiceError('User already exists', 409);
    }

    // Create new user following the User schema
    // Use retry loop to avoid rare duplicate `userId` collisions when tests run quickly
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
        break;
      } catch (err) {
        // If duplicate key on userId, retry; otherwise propagate
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.userId) {
          // small delay to allow other inserts to complete
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 20));
          continue;
        }
        throw err;
      }
    }

    if (!created) {
      // Final fallback: generate a high-entropy userId to avoid collisions in fast test environments
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

    // Convert to object and remove password
    const userObject = created.toObject();
    delete userObject.password;
    return userObject;
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<Object>} User object (without password)
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
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object (without password)
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
 * Get next available userId for MongoDB
 * @returns {Promise<number>} Next userId
 */
const getNextUserId = async () => {
  const lastUser = await User.findOne().sort({ userId: -1 });
  return lastUser ? lastUser.userId + 1 : 1;
};

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
