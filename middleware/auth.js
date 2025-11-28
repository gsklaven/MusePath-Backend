/**
 * Basic Authentication Middleware
 * Simulates authentication for development purposes
 */

/**
 * Basic auth middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // For development: Accept any request
    // In production, implement proper authentication (JWT, OAuth, etc.)
    
    // Extract user info from headers or query (if provided)
    const userId = req.headers['x-user-id'] || req.query.user_id;
    
    if (userId) {
      req.user = { userId: Number(userId) };
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Optional auth middleware (doesn't block if no auth provided)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.user_id;
    
    if (userId) {
      req.user = { userId: Number(userId) };
    }
    
    next();
  } catch (error) {
    next();
  }
};
