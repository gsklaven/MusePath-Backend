import jwt from 'jsonwebtoken';

// --- Token revocation (simple in-memory blacklist) ---
// Note: In-memory blacklist is suitable only for single-instance dev setups.
// For production use a shared store (Redis) so revocations propagate across instances.
const tokenBlacklist = new Map(); // token -> expiry (epoch seconds)

/**
 * Revoke a JWT token until its expiry
 * @param {string} token
 */
export const revokeToken = (token) => {
  if (!token) return;
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;
    // store expiry time (seconds)
    tokenBlacklist.set(token, decoded.exp);
  } catch (e) {
    // ignore
  }
};

/**
 * Check whether a token has been revoked
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenRevoked = (token) => {
  if (!token) return false;
  const exp = tokenBlacklist.get(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  if (exp <= now) {
    // token already expired; remove from blacklist
    tokenBlacklist.delete(token);
    return false;
  }
  return true;
};

export { tokenBlacklist };

/**
 * Helper to extract token from request for logout
 * @param {Object} req 
 * @returns {string|null}
 */
const getTokenFromRequest = (req) => {
  if (!req) return null;
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

/**
 * Logout helper: revoke token and optionally clear cookie via response
 * @param {Object} options
 * @param {string} [options.token] - JWT token string (if omitted, will try to read from req)
 * @param {Object} [options.req] - Express request object (used to find token if not provided)
 * @param {Object} [options.res] - Express response object (used to clear cookie)
 * @returns {boolean} true when logout actions performed
 */
export const logoutUser = ({ token, req, res } = {}) => {
  try {
    const tokenToRevoke = token || getTokenFromRequest(req);
    
    if (tokenToRevoke) revokeToken(tokenToRevoke);
    if (res) try { res.clearCookie('token'); } catch (e) {}
    return true;
  } catch (err) { return false; }
};