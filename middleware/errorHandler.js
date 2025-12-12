/**
 * Centralized Error Handler Middleware
 */

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, _, res, __) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Validation error',
      error: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Invalid ID format',
      error: err.message
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      data: null,
      message: `Duplicate value for ${field}`,
      error: `${field} already exists`
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : message
  });
};

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    data: null,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
};
