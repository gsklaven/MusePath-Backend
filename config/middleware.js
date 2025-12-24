/**
 * Middleware Configuration
 * Centralized configuration for Express middleware.
 */
import { RATE_LIMIT } from './constants.js';

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * Defines allowed origins and credentials settings.
 * @type {import('cors').CorsOptions}
 */
export const corsOptions = Object.freeze({
  origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
});

/**
 * Rate limiting configuration.
 * Controls request throttling parameters to prevent abuse.
 * @type {import('express-rate-limit').Options}
 */
export const rateLimitOptions = Object.freeze({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    data: null,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * JSON body parser configuration.
 * Sets the maximum request body size.
 * @type {import('body-parser').OptionsJson}
 */
export const jsonParserOptions = Object.freeze({ limit: '10mb' });

/**
 * URL-encoded body parser configuration.
 * Sets extended mode and maximum request body size.
 * @type {import('body-parser').OptionsUrlencoded}
 */
export const urlEncodedOptions = Object.freeze({ extended: true, limit: '10mb' });