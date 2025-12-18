import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../services/authService.js";
import { getJwtSecret } from "../config/constants.js";

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

  const validationRules = [
    {
      rule: (p) => p.length >= 8,
      message: 'Password must be at least 8 characters long',
    },
    {
      rule: (p) => /^[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+$/.test(p),
      message: 'Password contains invalid characters. Use only latin letters, digits and common special characters',
    },
    {
      rule: (p) => /[A-Z]/.test(p),
      message: 'Password must contain at least one uppercase letter',
    },
    {
      rule: (p) => /[a-z]/.test(p),
      message: 'Password must contain at least one lowercase letter',
    },
    {
      rule: (p) => /[0-9]/.test(p),
      message: 'Password must contain at least one digit',
    },
    {
      rule: (p) => /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(p),
      message: 'Password must contain at least one special character',
    },
  ];

  for (const { rule, message } of validationRules) {
    if (!rule(password)) {
      return { isValid: false, message };
    }
  }

  return { isValid: true, message: 'Password is strong' };
};

const extractToken = (req) => {
  const cookieToken = req.cookies && req.cookies.token;
  const headerToken = req.headers?.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  return cookieToken || headerToken;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, data: null, message: 'Authentication token required' });
    }

    if (isTokenRevoked(token)) {
      return res.status(401).json({ success: false, data: null, message: 'Token revoked' });
    }

    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);

    // normalize user payload; adapt to how you sign tokens (e.g., { id } or { userId })
    req.user = { id: payload.id || payload.userId || payload.sub, ...payload };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, data: null, message: 'Token is not valid', error: err.message });
  }
};

/* exported optionalAuth */
export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);

    if (!token || isTokenRevoked(token)) {
      return next();
    }

    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id || payload.userId || payload.sub, ...payload };
    return next();
  } catch (_) {
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
      if (!req.user) {
        return res.status(401).json({ success: false, data: null, message: 'Not authenticated' });
      }

      const paramValue = req.params && req.params[paramName];
      if (!paramValue) {
        return res.status(400).json({ success: false, data: null, message: `Missing param ${paramName}` });
      }

      if (String(paramValue) !== String(req.user.id)) {
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