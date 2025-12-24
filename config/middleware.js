/**
 * Middleware Configuration
 * Centralized settings for Express middleware components.
 */
import { RATE_LIMIT } from './constants.js';

/**
 * Gets allowed CORS origins from environment.
 * @returns {string[]} Array of allowed origin URLs
 */
const getAllowedOrigins = () => {
  const origins = [process.env.CLIENT_URL];
  
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:3001');
  }
  
  return origins.filter(Boolean);
};

/**
 * Creates rate limit error response.
 * @returns {Object} Standardized error response
 */
const createRateLimitMessage = () => ({
  success: false,
  data: null,
  message: 'Too many requests from this IP, please try again later.',
  error: 'Rate limit exceeded'
});

// CORS configuration
export const corsOptions = Object.freeze({
  origin: getAllowedOrigins(),
  credentials: true
});

// Rate limiting configuration
export const rateLimitOptions = Object.freeze({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: createRateLimitMessage(),
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser configurations
export const jsonParserOptions = Object.freeze({ 
  limit: '10mb' 
});

export const urlEncodedOptions = Object.freeze({ 
  extended: true, 
  limit: '10mb' 
});