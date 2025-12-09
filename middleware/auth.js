import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../services/authService.js";

const DEV_FALLBACK_SECRET = "dev-jwt-secret-change-me";

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || DEV_FALLBACK_SECRET;

export const verifyToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const headerToken = req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ success: false, data: null, message: "Not authenticated" });
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