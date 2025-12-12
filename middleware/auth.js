import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../services/authService.js";

const DEV_FALLBACK_SECRET = "dev-jwt-secret-change-me";

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || DEV_FALLBACK_SECRET;

/**
 * Validate email format
 * Only allows standard email characters to prevent NoSQL injection
 * @param {string} email - Email address
 * @returns {boolean} Validation result
 */
export const validateEmailFormat = (email) => {
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string' };
  }
  // Only allow alphanumeric, dots, underscores, percent, hyphens, and plus signs
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  return { isValid: true, message: 'Valid email' };
};

/**
 * Validate username format
 * Only allows alphanumeric characters, underscores, and hyphens
 * Prevents NoSQL injection and special characters
 * @param {string} username - Username
 * @returns {boolean} Validation result
 */
export const validateUsernameFormat = (username) => {
  if (typeof username !== 'string') {
    return { isValid: false, message: 'Username must be a string' };
  }
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, message: 'Username must be 3-30 characters long' };
  }
  // Only allow letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: 'Username can only contain latin characters, numbers, underscores, and hyphens' };
  }
  return { isValid: true, message: 'Valid username' };
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 * - Only latin letters, digits and common special characters allowed
 *
 * @param {string} password
 * @returns {{isValid: boolean, message: string}}
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Allowed characters: A-Z a-z 0-9 and common ASCII special characters
  const allowedChars = /^[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+$/;
  if (!allowedChars.test(password)) {
    return { isValid: false, message: 'Password contains invalid characters. Use only latin letters, digits and common special characters' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password);

  if (!hasUpper) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLower) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasDigit) {
    return { isValid: false, message: 'Password must contain at least one digit' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: 'Password is strong' };
};

export const verifyToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const headerToken = req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ success: false, data: null, message: "Authentication token required" });
    }

    if (isTokenRevoked(token)) {
      return res.status(401).json({ success: false, data: null, message: "Token revoked" });
    }

    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);

    // normalize user payload; adapt to how you sign tokens (e.g., { id } or { userId })
    req.user = { id: payload.id || payload.userId || payload.sub, ...payload };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, data: null, message: "Token is not valid", error: err.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const headerToken = req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return next();
    }

    if (isTokenRevoked(token)) {
      return next();
    }

    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id || payload.userId || payload.sub, ...payload };
    return next();
  } catch (err) {
    // don't block on invalid token in optional mode
    return next();
  }
};

/**
 * Authorization middleware: ensures the authenticated user matches the route param
 * Usage: `authorizeSameUser()` which checks `req.params.user_id` by default
 */
export const authorizeSameUser = (paramName = 'user_id') => {
  return (req, res, next) => {
    try {
      const paramValue = req.params && req.params[paramName];
      if (!req.user) {
        return res.status(401).json({ success: false, data: null, message: 'Not authenticated' });
      }

      if (!paramValue) {
        return res.status(400).json({ success: false, data: null, message: `Missing param ${paramName}` });
      }

      const userId = String(req.user.id || req.user.userId || req.userId || req.user._id || '');
      if (String(paramValue) !== userId) {
        return res.status(403).json({ success: false, data: null, message: 'Forbidden: cannot access other user data' });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ success: false, data: null, message: 'Authorization check failed', error: err.message });
    }
  };
};

/**
 * Authorization middleware: ensures the authenticated user has admin role
 * Usage: `requireAdmin` after `verifyToken`
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'Not authenticated' });
    }

    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden: admin access required' });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, data: null, message: 'Authorization check failed', error: err.message });
  }
};