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
 * Logout helper: revoke token and optionally clear cookie via response
 * @param {Object} options
 * @param {string} [options.token] - JWT token string (if omitted, will try to read from req)
 * @param {Object} [options.req] - Express request object (used to find token if not provided)
 * @param {Object} [options.res] - Express response object (used to clear cookie)
 * @returns {boolean} true when logout actions performed
 */
export const logoutUser = ({ token, req, res } = {}) => {
  try {
    let t = token;
    if (!t && req) {
      const cookieToken = req.cookies?.token || null;
      const authHeader = req.headers?.authorization || req.headers?.Authorization || null;
      const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      t = cookieToken || headerToken || null;
    }
    if (t) revokeToken(t);
    if (res) try { res.clearCookie('token'); } catch (e) {}
    return true;
  } catch (err) { return false; }
};