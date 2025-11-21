import morgan from 'morgan';

/**
 * Logger Middleware
 * Uses Morgan for HTTP request logging
 */

/**
 * Get logger middleware based on environment
 * @returns {Function} Morgan middleware
 */
export const getLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    // Combined format for production
    return morgan('combined');
  }
  
  // Custom format for development
  return morgan(':method :url :status :res[content-length] - :response-time ms');
};

/**
 * Custom request logger
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};
